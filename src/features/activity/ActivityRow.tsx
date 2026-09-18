import { ActionIcon, Box, Group, Menu, Text, useMantineTheme } from "@mantine/core";
import { Check, MoreHorizontal, Undo2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AppNotification } from "@/shared/types";
import { notificationCopy, relativeTime } from "./copy";
import { NOTIFICATION_VISUALS, showsAvatar } from "./visuals";
import classes from "./ActivityRow.module.css";

/**
 * One notification.
 *
 * The whole row is the click target and it does three things at once: marks the
 * notification read, navigates to whatever it refers to, and closes the panel.
 * That is the action a reader wants in every case, and splitting it into
 * separate controls would mean a row where the obvious click does only part of
 * what was meant.
 *
 * The overflow menu exists for the other case — putting something aside, or
 * clearing it without going anywhere.
 */
export function ActivityRow({
  notification,
  actorName,
  actorAvatarUrl,
  onOpen,
  onMarkRead,
  onMarkUnread,
}: {
  notification: AppNotification;
  /** The actor's display name, where the row shows a person. */
  actorName?: string;
  actorAvatarUrl?: string;
  onOpen: (notification: AppNotification) => void;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const theme = useMantineTheme();

  const unread = !notification.readAt;
  const copy = notificationCopy(notification, t);
  const visual = NOTIFICATION_VISUALS[notification.type];
  const Icon = visual.icon;

  // Mantine's palette, read at the shade that holds up on both themes.
  const accent = theme.colors[visual.color]?.[6] ?? theme.colors.gray[6];
  const wash = theme.colors[visual.color]?.[0] ?? theme.colors.gray[1];

  const withAvatar = showsAvatar(notification.type) && Boolean(actorAvatarUrl || actorName);

  return (
    <Box
      component="button"
      type="button"
      className={classes.row}
      data-unread={unread}
      onClick={() => onOpen(notification)}
    >
      <Group gap={10} wrap="nowrap" align="flex-start">
        <div className={classes.dotSlot}>{unread && <span className={classes.dot} />}</div>

        <div
          className={classes.chip}
          style={{
            background: withAvatar ? undefined : wash,
            color: accent,
            // An avatar fills its chip; a type icon sits on its own wash.
            backgroundImage: actorAvatarUrl ? `url(${actorAvatarUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden
        >
          {withAvatar ? (
            // Initials behind the image, so a broken or missing avatar still
            // reads as a person rather than an empty square.
            !actorAvatarUrl && (
              <Text fz={13} fw={700} c={visual.color}>
                {(actorName ?? "?").slice(0, 1).toUpperCase()}
              </Text>
            )
          ) : (
            <Icon size={17} strokeWidth={1.9} />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <Text fz="sm" fw={unread ? 600 : 500} lh={1.4} style={{ wordBreak: "break-word" }}>
            {copy.title}
          </Text>

          {copy.body && (
            <Text
              fz="xs"
              c="dimmed"
              lh={1.5}
              mt={2}
              // Two lines is enough for every generated sentence, and caps an
              // admin message that was written as an essay.
              lineClamp={2}
              style={{ wordBreak: "break-word" }}
            >
              {copy.body}
            </Text>
          )}

          <Text fz={11} c="dimmed" mt={4}>
            {relativeTime(notification.createdAt, t, i18n.language)}
          </Text>
        </div>

        <div className={classes.actions}>
          <Menu position="bottom-end" withArrow radius="md" width={180} withinPortal zIndex={500}>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                aria-label={t("activity.rowActions", "Notification actions")}
                // The row beneath is a button too, and a click here means the
                // menu, not "open this notification".
                onClick={(event) => event.stopPropagation()}
              >
                <MoreHorizontal size={15} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown onClick={(event) => event.stopPropagation()}>
              {unread ? (
                <Menu.Item
                  leftSection={<Check size={14} />}
                  onClick={() => onMarkRead(notification.id)}
                >
                  {t("activity.markRead", "Mark as read")}
                </Menu.Item>
              ) : (
                <Menu.Item
                  leftSection={<Undo2 size={14} />}
                  onClick={() => onMarkUnread(notification.id)}
                >
                  {t("activity.markUnread", "Mark as unread")}
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </div>
      </Group>
    </Box>
  );
}
