import type { KeyboardEvent } from "react";
import { ActionIcon, Button, Checkbox, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AppNotification } from "@/shared/types";
import { notificationCopy, notificationTypeLabel, relativeTime } from "./copy";
import { NOTIFICATION_VISUALS, showsAvatar } from "./visuals";
import classes from "./ActivityRow.module.css";

/**
 * One notification in the panel: a flat row in a divided list.
 *
 * Unread is a dot and a heavier title rather than a tinted card — a panel of
 * boxed rows spends all its emphasis at once. The whole row is the target;
 * it is a focusable `div` with button semantics rather than a `<button>`,
 * because it holds real buttons (Accept / Decline, Mark as read) and buttons
 * cannot nest.
 */
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
  /** Marks the row read without navigating (Decline, and the hover check). */
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

  const withAvatar = showsAvatar(notification.type) && Boolean(actorAvatarUrl || actorName);
  const isPendingInvite = notification.type === "invite.received" && unread;
  // An invite that has been accepted or declined stays as history but no
  // longer goes anywhere, so it drops every interactive cue.
  const isSettledInvite = notification.type === "invite.received" && !unread;
  const interactive = selectable || !isSettledInvite;
  const canMarkRead = unread && !selectable && !isPendingInvite;

  const activate = () => (selectable ? onToggleSelect?.(notification.id) : onOpen(notification));
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={classes.row}
      data-unread={unread || undefined}
      // Only while unread: a failure that has been read is history, and a row
      // that keeps shouting after it has been dealt with is what teaches
      // people to stop reading the panel.
      data-severity={(unread && visual.severity) || undefined}
      data-settled={isSettledInvite || undefined}
      data-selected={(selectable && selected) || undefined}
      data-can-mark={canMarkRead || undefined}
      onClick={interactive ? activate : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
    >
      {selectable ? (
        <Checkbox
          checked={selected}
          onChange={() => onToggleSelect?.(notification.id)}
          onClick={(event) => event.stopPropagation()}
          size="sm"
          className={classes.check}
          aria-label={t("activity.selectRow", "Select notification")}
        />
      ) : (
        <span className={classes.dot} aria-hidden />
      )}

      <div
        className={classes.chip}
        data-kind={withAvatar ? "avatar" : visual.image ? "image" : "icon"}
        style={
          withAvatar && actorAvatarUrl
            ? { backgroundImage: `url(${actorAvatarUrl})` }
            : { color: accent }
        }
        aria-hidden
      >
        {withAvatar ? (
          // Initials behind the image, so a broken or missing avatar still
          // reads as a person rather than an empty circle.
          !actorAvatarUrl && (actorName?.trim() || "?").slice(0, 1).toUpperCase()
        ) : visual.image ? (
          <img src={visual.image} alt="" width={32} height={32} />
        ) : (
          <Icon size={16} strokeWidth={2} />
        )}
      </div>

      <div className={classes.main}>
        <div className={classes.titleRow}>
          <Text component="span" className={classes.title} data-unread={unread || undefined}>
            {copy.title}
          </Text>
          <span className={classes.time}>{relativeTime(notification.createdAt, t, i18n.language)}</span>
        </div>

        {copy.body && (
          <Text
            className={classes.body}
            // Two lines is enough for every generated sentence, and caps an
            // admin message that was written as an essay.
            lineClamp={2}
          >
            {copy.body}
          </Text>
        )}

        <div className={classes.meta}>
          <span>{notificationTypeLabel(notification.type, t)}</span>
          {isSettledInvite && !selectable && (
            <span>· {t("activity.inviteHandled", "Responded")}</span>
          )}
        </div>

        {isPendingInvite && !selectable && (
          <div className={classes.actions} onClick={(event) => event.stopPropagation()}>
            <Button size="compact-sm" onClick={() => onOpen(notification)}>
              {t("activity.accept", "Accept")}
            </Button>
            <Button size="compact-sm" variant="default" onClick={() => onMarkRead(notification.id)}>
              {t("activity.decline", "Decline")}
            </Button>
          </div>
        )}
      </div>

      {canMarkRead && (
        <Tooltip label={t("activity.markRead", "Mark as read")} withArrow position="left">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            className={classes.markRead}
            aria-label={t("activity.markRead", "Mark as read")}
            onClick={(event) => {
              event.stopPropagation();
              onMarkRead(notification.id);
            }}
          >
            <Check size={14} />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  );
}
