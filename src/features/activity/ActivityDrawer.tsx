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
import { BellOff, CheckCheck, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationsReadMutation,
  useMarkNotificationUnreadMutation,
  useMarkNotificationsSeenMutation,
} from "@/app/store";
import { EmptyState } from "@/shared/ui/EmptyState";
import type { AppNotification } from "@/shared/types";
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

  const [tab, setTab] = useState<"all" | "unread">("all");
  const [cursor, setCursor] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetNotificationsQuery(
    { unread: tab === "unread", cursor },
    // Nothing is fetched until the panel is actually opened: the feed is the
    // expensive half of this feature and most sessions never look at it.
    { skip: !opened },
  );

  const [markSeen] = useMarkNotificationsSeenMutation();
  const [markRead] = useMarkNotificationsReadMutation();
  const [markUnread] = useMarkNotificationUnreadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  /*
   * Opening the panel clears the badge but marks nothing read.
   *
   * This is the whole reason the backend keeps `seenAt` apart from `readAt`: a
   * reader who opens the panel has been shown what is waiting, so the count is
   * answered — but the individual rows they did not click are still theirs to
   * come back to.
   */
  useEffect(() => {
    if (opened && unreadCount > 0) void markSeen();
  }, [opened, unreadCount, markSeen]);

  // Switching tabs is a different list, so paging starts again from the top.
  useEffect(() => {
    setCursor(null);
  }, [tab]);

  const items = data?.items ?? [];

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
              <Tooltip label={t("activity.markAllRead", "Mark all as read")} withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  // Nothing to do at zero unread, and a live button that does
                  // nothing is worse than one that says so.
                  disabled={unreadCount === 0 || markingAll}
                  loading={markingAll}
                  onClick={() => void markAllRead()}
                  aria-label={t("activity.markAllRead", "Mark all as read")}
                >
                  <CheckCheck size={17} />
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
            </Group>
          </Group>

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
                      onMarkRead={(id) => void markRead({ ids: [id] })}
                      onMarkUnread={(id) => void markUnread({ id })}
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
