import { Modal, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { AppNotification } from "@/shared/types";
import classes from "./ActivityRow.module.css";

/**
 * The full set of answers for a `form.submission` row.
 *
 * Every other notification type just navigates via `link` — there is nowhere
 * else to send this one, since the lead lives inside the forms app's own
 * iframe and that app has no per-submission route this dashboard can deep
 * link into. So the answers travel in the notification's own `data` instead,
 * and clicking the row opens them here.
 *
 * Styled after `answerList`/`answerRow` in the forms app's own notification
 * settings (`NotificationsModal.module.css`) — the same label/value list
 * already used for a submission's answers, not a new shape invented here.
 */
export function SubmissionDetailModal({
  notification,
  onClose,
}: {
  notification: AppNotification | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const data = notification?.data ?? {};
  const formTitle =
    typeof data.formTitle === "string" && data.formTitle ? data.formTitle : t("activity.aForm", "a form");
  const answers = Array.isArray(data.answers) ? (data.answers as { label: string; value: string }[]) : [];

  return (
    <Modal opened={Boolean(notification)} onClose={onClose} title={formTitle} size="md" radius="lg">
      {answers.length === 0 ? (
        <Text size="sm" c="dimmed" fs="italic">
          {t("activity.formSubmission.noAnswers", "No answers were recorded for this submission.")}
        </Text>
      ) : (
        <Stack gap={0} className={classes.answerList}>
          {answers.map((a, i) => (
            <div key={`${a.label}-${i}`} className={classes.answerRow}>
              <Text size="xs" c="dimmed">
                {a.label}
              </Text>
              <Text size="sm" ta="right" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {a.value || "—"}
              </Text>
            </div>
          ))}
        </Stack>
      )}
    </Modal>
  );
}
