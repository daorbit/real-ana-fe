import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  Group,
  Menu,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  ActionIcon,
} from "@mantine/core";
import { BellOff, CheckCheck, ListChecks, MoreHorizontal, Settings2, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationsReadMutation,
  useMarkNotificationsSeenMutation,
  useDeleteNotificationsMutation,
} from "@/app/store";
import { EmptyState } from "@/shared/ui/EmptyState";
import type { AppNotification } from "@/shared/types";
import { useDemo } from "@/features/demo/context";
import { demoNotifications } from "@/features/demo/demoNotifications";
import { ActivityRow } from "./ActivityRow";
import { SubmissionDetailModal } from "./SubmissionDetailModal";
import { dateGroup, dateGroupLabel, type DateGroup } from "./copy";
import classes from "./ActivityRow.module.css";
import styles from "./ActivityDrawer.module.css";

/**
 * The notification panel.
 *
 * A right-hand drawer rather than a dropdown under the bell. The bell lives in
 * a left rail that collapses, so a menu anchored to it would open sideways into
 * the page from a point that moves; a drawer is the same component at every
 * rail width and becomes a full-screen sheet on a phone for free.
 *
 * The list is fetched when the drawer opens, not on a timer. Only the badge
 * polls — see `useNotificationCount`.
 */
export function ActivityDrawer({
  opened,
  onClose,
  unreadCount,
}: {
  opened: boolean;
  onClose: () => void;
  unreadCount: number;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { demo } = useDemo();

  const [tab, setTab] = useState<"all" | "unread">("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<AppNotification | null>(null);

  // The shell's panel — the bordered card the page sits in. Rendering into it
  // keeps the feed inside the app rather than over it. Null before the shell
  // has mounted, and on any screen that has no panel, where the drawer falls
  // back to Mantine's own body portal.
  const [panelRoot, setPanelRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPanelRoot(document.getElementById("panel-overlay-root"));
  }, []);

  const { data: fetched, isLoading, isFetching, refetch } = useGetNotificationsQuery(
    { unread: tab === "unread", cursor },
    // Nothing is fetched until the panel is actually opened: the feed is the
    // expensive half of this feature and most sessions never look at it. Demo
    // mode skips it too — the panel shows sample rows instead, and there is
    // nothing real underneath worth fetching for a workspace with no traffic.
    { skip: !opened || demo },
  );

  /*
   * Reopening the panel fetches the feed again.
   *
   * The badge polls on its own timer, so a notification that arrived since the
   * last open is counted long before the list knows about it. Without this the
   * cached feed is served straight back and the panel opens with a badge
   * promising rows that are not in it.
   *
   * Only on the first page: `cursor` non-null means older pages have been
   * loaded, and refetching from the top would throw them away.
   */
  useEffect(() => {
    if (opened && !demo && cursor === null) void refetch();
    // `cursor` is read but deliberately not a trigger — this fires on open,
    // not on every page loaded while the panel is already up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, demo, refetch]);

  // Same swap as the stats hook: generated rows while demo mode is on, so an
  // empty workspace does not show the one panel in the app that still looks
  // unused. Filtered here rather than in the generator, so the Unread tab
  // still behaves like a real list.
  const data = demo
    ? { ...demoNotifications(), items: demoNotifications().items.filter((n) => tab !== "unread" || !n.readAt) }
    : fetched;

  const [markSeen] = useMarkNotificationsSeenMutation();
  const [markRead] = useMarkNotificationsReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const [deleteNotifications, { isLoading: deleting }] = useDeleteNotificationsMutation();

  /*
   * Opening the panel clears the badge but marks nothing read.
   *
   * This is the whole reason the backend keeps `seenAt` apart from `readAt`: a
   * reader who opens the panel has been shown what is waiting, so the count is
   * answered — but the individual rows they did not click are still theirs to
   * come back to.
   */
  useEffect(() => {
    if (opened && unreadCount > 0 && !demo) void markSeen();
  }, [opened, unreadCount, demo, markSeen]);

  // Switching tabs is a different list, so paging starts again from the top.
  useEffect(() => {
    setCursor(null);
    setSelecting(false);
    setSelected(new Set());
  }, [tab]);

  // Closing the panel with a selection in progress should not leave it primed
  // for whatever happens to be on screen next time it opens.
  useEffect(() => {
    if (!opened) {
      setSelecting(false);
      setSelected(new Set());
    }
  }, [opened]);

  const items = data?.items ?? [];

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    if (!selected.size) return;
    // Demo rows have no server side to delete — dropping the selection is
    // enough to end the flow the same way a real delete would.
    if (!demo) await deleteNotifications({ ids: [...selected] });
    setSelecting(false);
    setSelected(new Set());
  };

  /**
   * Rows under their date headings, in feed order.
   *
   * Grouped at render rather than stored grouped, because "today" changes while
   * the panel is open — a tab left open overnight should not still be filing
   * yesterday's notifications under Today.
   */
  const grouped = useMemo(() => {
    const groups: { group: DateGroup; items: AppNotification[] }[] = [];
    for (const item of items) {
      const group = dateGroup(item.createdAt);
      const last = groups[groups.length - 1];
      if (last?.group === group) last.items.push(item);
      else groups.push({ group, items: [item] });
    }
    return groups;
  }, [items]);

  const open = (notification: AppNotification) => {
    // A submission's answers live only in the row's own `data` — there is no
    // per-submission route to send this to inside the forms app's iframe, so
    // it opens in a modal instead of navigating like every other type.
    if (notification.type === "form.submission") {
      if (!demo && !notification.readAt) void markRead({ ids: [notification.id] });
      setDetail(notification);
      return;
    }
    // Demo rows close the panel and show where a real click would land, but
    // nothing is marked read on the server and the fake invite link goes
    // nowhere real, so it stays put rather than 404ing.
    if (demo) {
      if (notification.link && notification.type !== "invite.received") navigate(notification.link);
      onClose();
      return;
    }

    // An invite that has already been acted on (accepted or declined) must not
    // navigate to the /invite/:token page — the token is spent and that page
    // would show a "not valid" error.  The row stays in the feed as history,
    // but clicking it is a no-op.
    if (notification.type === "invite.received" && notification.readAt) {
      return;
    }

    if (!notification.readAt) void markRead({ ids: [notification.id] });
    if (notification.link) navigate(notification.link);
    onClose();
  };

  const showEmpty = !isLoading && items.length === 0;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={440}
      padding={0}
      radius={0}
      // The panel's own header is built below, with the tabs and actions in it.
      withCloseButton={false}
      // Rendered into the shell's panel rather than over the window, so the
      // rail stays reachable while the feed is open. Falls back to Mantine's
      // own body portal on any screen without a panel — the auth pages.
      portalProps={panelRoot ? { target: panelRoot } : undefined}
      withinPortal={Boolean(panelRoot)}
      classNames={
        panelRoot
          ? {
              root: styles.root,
              overlay: styles.overlay,
              inner: styles.inner,
              content: styles.content,
            }
          : undefined
      }
      // Absolute rather than fixed: the overlay and sheet position against the
      // panel they are rendered into, not the viewport.
      overlayProps={
        panelRoot
          ? { blur: 2, backgroundOpacity: 0 }
          : { backgroundOpacity: 0.35, blur: 2 }
      }
      transitionProps={{ duration: 180, transition: "slide-left" }}
      aria-label={t("activity.title", "Activity")}
    >
      {/* Grows to the sheet's full height rather than to its content, so the
          footer is pinned to the bottom edge and not left floating under a
          short feed. */}
      <Stack gap={0} className={styles.body}>
        <Box className={styles.header}>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap={8} wrap="nowrap" align="center">
              <Text fw={680} fz="lg" className={styles.title}>
                {t("activity.title", "Activity")}
              </Text>
              {/* Opening the panel clears the bell's badge, so without this
                  the count vanishes at the moment it becomes readable. */}
              {unreadCount > 0 && (
                <span className={styles.count}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Group>

            <Group gap={4} wrap="nowrap">
              {!selecting && (
                <>
                  {/* The title row keeps only what is not a primary action:
                      marking everything read and closing both live in the
                      footer bar, where they stay reachable at any scroll
                      position. */}
                  <Menu position="bottom-end" withArrow radius="md" width={210} withinPortal>
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label={t("activity.moreActions", "More actions")}
                      >
                        <MoreHorizontal size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<ListChecks size={14} />}
                        disabled={items.length === 0}
                        onClick={() => setSelecting(true)}
                      >
                        {t("activity.select", "Select notifications")}
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<Settings2 size={14} />}
                        onClick={() => {
                          navigate("/app/settings?tab=notifications");
                          onClose();
                        }}
                      >
                        {t("activity.preferences", "Notification settings")}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </>
              )}

              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={onClose}
                aria-label={t("activity.close", "Close")}
              >
                <X size={18} />
              </ActionIcon>
            </Group>
          </Group>

          {selecting ? (
            <Group justify="space-between" align="center" mt="sm" wrap="nowrap">
              <Text fz="sm" c="dimmed">
                {t("activity.selectedCount", "{{count}} selected", { count: selected.size })}
              </Text>
              <Group gap="xs" wrap="nowrap">
                <Button
                  variant="subtle"
                  color="gray"
                  size="xs"
                  onClick={() => {
                    setSelecting(false);
                    setSelected(new Set());
                  }}
                >
                  {t("activity.cancel", "Cancel")}
                </Button>
                <Button
                  variant="light"
                  color="red"
                  size="xs"
                  leftSection={<Trash2 size={14} />}
                  disabled={selected.size === 0 || deleting}
                  loading={deleting}
                  onClick={() => void deleteSelected()}
                >
                  {t("activity.deleteSelected", "Delete")}
                </Button>
              </Group>
            </Group>
          ) : (
            <SegmentedControl
              fullWidth
              size="xs"
              radius="md"
              mt={12}
              className={styles.tabs}
              value={tab}
              onChange={(value) => setTab(value as "all" | "unread")}
              data={[
                { value: "all", label: t("activity.tabAll", "All") },
                {
                  value: "unread",
                  label:
                    unreadCount > 0
                      ? `${t("activity.tabUnread", "Unread")} · ${unreadCount > 99 ? "99+" : unreadCount}`
                      : t("activity.tabUnread", "Unread"),
                },
              ]}
            />
          )}
        </Box>

        {/* No rule here: the header carries its own bottom border. */}
        <ScrollArea className={styles.scroll} type="hover" offsetScrollbars={false}>
          {isLoading && (
            // Skeleton rows rather than a spinner: the panel's shape is known
            // before its contents are, and showing it settles the layout
            // instead of making it jump when the data lands.
            <Stack gap={4} p="sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <Group key={i} gap={10} wrap="nowrap" p={10}>
                  <Skeleton height={34} width={34} radius={10} />
                  <Stack gap={6} style={{ flex: 1 }}>
                    <Skeleton height={9} width="55%" radius="xl" />
                    <Skeleton height={8} width="85%" radius="xl" />
                  </Stack>
                </Group>
              ))}
            </Stack>
          )}

          {showEmpty && (
            <EmptyState
              compact
              icon={BellOff}
              title={
                tab === "unread"
                  ? t("activity.empty.unreadTitle", "You're all caught up")
                  : t("activity.empty.title", "Nothing here yet")
              }
              description={
                tab === "unread"
                  ? t("activity.empty.unreadBody", "Every notification has been read.")
                  : t(
                      "activity.empty.body",
                      "Reports, invitations and billing updates will show up here as they happen.",
                    )
              }
            />
          )}

          {!isLoading &&
            grouped.map(({ group, items: rows }) => (
              <div key={group}>
                {/* No rule between groups: the sticky date heading already
                    says where one ends and the next begins, and a line under
                    it as well read as a band across the panel. */}
                <div className={classes.groupLabel}>{dateGroupLabel(group, t)}</div>
                <Stack gap={6} px={8} pb={10}>
                  {rows.map((notification) => (
                    <ActivityRow
                      key={notification.id}
                      notification={notification}
                      actorName={
                        typeof notification.data?.actorName === "string"
                          ? notification.data.actorName
                          : typeof notification.data?.inviterName === "string"
                            ? notification.data.inviterName
                            : undefined
                      }
                      actorAvatarUrl={
                        typeof notification.data?.actorAvatarUrl === "string" &&
                        notification.data.actorAvatarUrl
                          ? notification.data.actorAvatarUrl
                          : undefined
                      }
                      onOpen={open}
                      onMarkRead={(id) => {
                        if (!demo) void markRead({ ids: [id] });
                      }}
                      selectable={selecting}
                      selected={selected.has(notification.id)}
                      onToggleSelect={toggleSelect}
                    />
                  ))}
                </Stack>
              </div>
            ))}

          {data?.nextCursor && (
            <Group justify="center" p="sm">
              <Button
                variant="subtle"
                size="xs"
                loading={isFetching}
                onClick={() => setCursor(data.nextCursor)}
              >
                {t("activity.loadMore", "Load older")}
              </Button>
            </Group>
          )}
        </ScrollArea>

        {/* Pinned under the feed rather than riding the title row: both of
            these act on the whole panel, and at the bottom they stay put
            however far down the list someone has scrolled. Hidden while
            selecting — that mode has its own Cancel and Delete. */}
        {!selecting && (
          <Group className={styles.footer} justify="space-between" wrap="nowrap">
            <Button variant="default" size="xs" onClick={onClose}>
              {t("activity.close", "Close")}
            </Button>
            <Button
              size="xs"
              leftSection={<CheckCheck size={14} />}
              disabled={unreadCount === 0 || markingAll || demo}
              loading={markingAll}
              onClick={() => void markAllRead()}
            >
              {t("activity.markAllRead", "Mark all as read")}
            </Button>
          </Group>
        )}
      </Stack>
      <SubmissionDetailModal notification={detail} onClose={() => setDetail(null)} />
    </Drawer>
  );
}
