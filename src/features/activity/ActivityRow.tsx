import { Box, Button, Checkbox, Group, Text, useMantineTheme } from "@mantine/core";
import { ChevronRight, ChevronDown } from "lucide-react";
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
  expanded = false,
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
  /** `form.submission` only: whether its answers are unfolded below the row. */
  expanded?: boolean;
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

  // Only an unread invite carries a live choice — once accepted or declined,
  // the row is just history and the buttons would have nothing left to do.
  const isPendingInvite = notification.type === "invite.received" && unread;

  const isExpandable = notification.type === "form.submission";
  const answers =
    isExpandable && Array.isArray(notification.data?.answers)
      ? (notification.data.answers as { label: string; value: string }[])
      : [];

  return (
    <Box className={classes.rowWrap} data-unread={unread}>
      <Box
        component="button"
        type="button"
        className={classes.row}
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
          </div>

          {!selectable &&
            (isExpandable ? (
              <ChevronDown
                size={16}
                className={classes.chevron}
                style={{
                  transform: expanded ? "rotate(180deg)" : undefined,
                  transition: "transform 120ms ease",
                }}
                aria-hidden
              />
            ) : (
              <ChevronRight size={16} className={classes.chevron} aria-hidden />
            ))}
        </Group>
      </Box>

      {isExpandable && expanded && (
        <Box className={classes.expandPanel} onClick={(event) => event.stopPropagation()}>
          {answers.length === 0 ? (
            <Text fz="xs" c="dimmed" fs="italic">
              {t("activity.formSubmission.noAnswers", "No answers were recorded for this submission.")}
            </Text>
          ) : (
            answers.map((a, i) => (
              <div key={`${a.label}-${i}`} className={classes.expandRow}>
                <Text fz={11} c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: 0.3 }}>
                  {a.label}
                </Text>
                <Text fz="sm" mt={2} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {a.value || "—"}
                </Text>
              </div>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
