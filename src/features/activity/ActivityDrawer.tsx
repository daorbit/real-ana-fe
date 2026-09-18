import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { BellOff, CheckCheck, ListChecks, Settings2, Trash2, X } from "lucide-react";
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
import { dateGroup, dateGroupLabel, type DateGroup } from "./copy";
import classes from "./ActivityRow.module.css";

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

  const { data: fetched, isLoading, isFetching } = useGetNotificationsQuery(
    { unread: tab === "unread", cursor },
    // Nothing is fetched until the panel is actually opened: the feed is the
    // expensive half of this feature and most sessions never look at it. Demo
    // mode skips it too — the panel shows sample rows instead, and there is
    // nothing real underneath worth fetching for a workspace with no traffic.
    { skip: !opened || demo },
  );

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
    // Demo rows close the panel and show where a real click would land, but
    // nothing is marked read on the server and the fake invite link goes
    // nowhere real, so it stays put rather than 404ing.
    if (demo) {
      if (notification.link && notification.type !== "invite.received") navigate(notification.link);
      onClose();
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
      overlayProps={{ backgroundOpacity: 0.35, blur: 2 }}
      transitionProps={{ duration: 180, transition: "slide-left" }}
      aria-label={t("activity.title", "Activity")}
    >
      <Stack gap={0} h="100%">
        <Box px="md" pt="md" pb="xs">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Text fw={680} fz="lg">
              {t("activity.title", "Activity")}
            </Text>

            <Group gap={4} wrap="nowrap">
              {!selecting && (
                <>
                  <Tooltip label={t("activity.markAllRead", "Mark all as read")} withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      // Nothing to do at zero unread, and a live button that does
                      // nothing is worse than one that says so. Also off in
                      // demo mode: there is no server state behind these rows
                      // for it to change.
                      disabled={unreadCount === 0 || markingAll || demo}
                      loading={markingAll}
                      onClick={() => void markAllRead()}
                      aria-label={t("activity.markAllRead", "Mark all as read")}
                    >
                      <CheckCheck size={17} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label={t("activity.select", "Select notifications")} withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      disabled={items.length === 0}
                      onClick={() => setSelecting(true)}
                      aria-label={t("activity.select", "Select notifications")}
                    >
                      <ListChecks size={17} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label={t("activity.preferences", "Notification settings")} withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => {
                        navigate("/app/settings?tab=notifications");
                        onClose();
                      }}
                      aria-label={t("activity.preferences", "Notification settings")}
                    >
                      <Settings2 size={17} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}

              <Tooltip label={t("activity.close", "Close")} withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={onClose}
                  aria-label={t("activity.close", "Close")}
                >
                  <X size={18} />
                </ActionIcon>
              </Tooltip>
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
              mt="sm"
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

        <Divider />

        <ScrollArea style={{ flex: 1 }} type="hover" offsetScrollbars={false}>
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
                <div className={classes.groupLabel}>{dateGroupLabel(group, t)}</div>
                <Stack gap={2} px={6} pb={4}>
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
      </Stack>
    </Drawer>
  );
}
