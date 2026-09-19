import { Box, Button, Checkbox, Group, Text, useMantineTheme } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AppNotification } from "@/shared/types";
import { notificationCopy, notificationTypeLabel, relativeTime } from "./copy";
import { NOTIFICATION_VISUALS, showsAvatar } from "./visuals";
import classes from "./ActivityRow.module.css";

export function ActivityRow({
  notification,
  actorName,
  actorAvatarUrl,
  onOpen,
  onMarkRead,
  selectable = false,
  selected = false,
  onToggleSelect,
}: {
  notification: AppNotification;
  /** The actor's display name, where the row shows a person. */
  actorName?: string;
  actorAvatarUrl?: string;
  onOpen: (notification: AppNotification) => void;
  /** Used by Decline on an invite: dismiss without navigating anywhere. */
  onMarkRead: (id: string) => void;
  /** Selection mode is on: shows a checkbox instead of the row acting as a link. */
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const theme = useMantineTheme();

  const unread = !notification.readAt;
  const copy = notificationCopy(notification, t);
  const visual = NOTIFICATION_VISUALS[notification.type];
  const Icon = visual.icon;

  const accent = theme.colors[visual.color]?.[6] ?? theme.colors.gray[6];
  const wash = theme.colors[visual.color]?.[0] ?? theme.colors.gray[1];

  const withAvatar = showsAvatar(notification.type) && Boolean(actorAvatarUrl || actorName);


  const isPendingInvite = notification.type === "invite.received" && unread;


  const isSettledInvite = notification.type === "invite.received" && !unread;

  return (
    <Box
      component="button"
      type="button"
      className={classes.row}
      data-unread={unread}
      // Only while unread: a failure that has been read is history, and a row
      // that keeps shouting after it has been dealt with is what teaches
      // people to stop reading the panel.
      data-severity={(unread && visual.severity) || undefined}
      data-settled={isSettledInvite || undefined}
      style={isSettledInvite ? { cursor: "default" } : undefined}
      onClick={() => (selectable ? onToggleSelect?.(notification.id) : onOpen(notification))}
    >
      <Group gap={10} wrap="nowrap" align="flex-start">
        {selectable && (
          <Checkbox
            checked={selected}
            onChange={() => onToggleSelect?.(notification.id)}
            onClick={(event) => event.stopPropagation()}
            size="sm"
            mt={11}
            aria-label={t("activity.selectRow", "Select notification")}
          />
        )}

        <div
          className={classes.chip}
          style={{
            // An avatar photo fills the chip on its own; initials still need
            // the wash behind them or they are invisible in dark mode.
            background: actorAvatarUrl || visual.image ? undefined : wash,
            color: accent,
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
                {(actorName?.trim() || "?").slice(0, 1).toUpperCase()}
              </Text>
            )
          ) : visual.image ? (
            <img
              src={visual.image}
              alt=""
              width={38}
              height={38}
              style={{ borderRadius: 999, objectFit: "cover", display: "block" }}
            />
          ) : (
            <Icon size={18} strokeWidth={2} />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <Text fz="sm" fw={unread ? 650 : 500} lh={1.4} style={{ wordBreak: "break-word" }}>
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
            {" · "}
            {notificationTypeLabel(notification.type, t)}
          </Text>

          {isPendingInvite && !selectable && (
            <Group gap={8} mt={8} onClick={(event) => event.stopPropagation()}>
              <Button size="xs" onClick={() => onOpen(notification)}>
                {t("activity.accept", "Accept")}
              </Button>
              <Button
                size="xs"
                variant="default"
                onClick={() => onMarkRead(notification.id)}
              >
                {t("activity.decline", "Decline")}
              </Button>
            </Group>
          )}
          {isSettledInvite && !selectable && (
            <Text fz={11} c="dimmed" mt={6} fs="italic">
              {t("activity.inviteHandled", "Responded")}
            </Text>
          )}
        </div>

        {!selectable && !isSettledInvite && (
          <ChevronRight size={16} className={classes.chevron} aria-hidden />
        )}
      </Group>
    </Box>
  );
}
