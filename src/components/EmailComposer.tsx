import { Modal, Text, Alert, Loader, Code, Center } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { useEmailComposer } from "../hooks/useEmailComposer";
import { AudienceStep } from "./email/AudienceStep";
import { WriteStep } from "./email/WriteStep";
import type { AdminUser } from "../types";

/**
 * Admin-only: compose and send a message, either to a segment, to a list of
 * addresses typed by hand, or to one account.
 *
 * Two steps rather than one long form. Choosing who to mail and writing what
 * they read are different decisions, and putting them on one screen meant the
 * audience — the part that is expensive to get wrong — competed for attention
 * with a textarea.
 *
 * This file is only the shell: which step is showing, and the one case where no
 * step should show at all. The state lives in `useEmailComposer`, and each step
 * renders itself.
 */
export function EmailComposer({
  opened,
  onClose,
  user,
}: {
  opened: boolean;
  onClose: () => void;
  /** Set to address exactly one account; omit for a broadcast. */
  user?: AdminUser | null;
}) {
  const state = useEmailComposer({ opened, onClose, user });
  const { single, step, status, statusLoading, busy, close } = state;

  const title = single
    ? `Message ${user?.name}`
    : step === "audience"
      ? "Who gets this?"
      : "Write your message";

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={title}
      centered
      radius="lg"
      // The preview needs room to show the mail at something near its real
      // width; the audience step does not.
      size={step === "audience" ? "md" : "lg"}
      closeOnClickOutside={false}
      closeOnEscape={!busy}
      withCloseButton={!busy}
    >
      {statusLoading ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : !status?.configured ? (
        // Checked before anything can be written: discovering that mail is
        // unconfigured after composing a message is a waste of the admin's time.
        <Alert color="orange" icon={<AlertTriangle size={16} />} title="Email isn't configured">
          <Text size="sm">
            The server has no Gmail credentials, so nothing can be sent yet. Set{" "}
            <Code>SMTP_USER</Code> and <Code>SMTP_PASS</Code> in the backend environment
            — <Code>SMTP_PASS</Code> must be a Google App Password, not the account
            password.
          </Text>
        </Alert>
      ) : step === "audience" ? (
        <AudienceStep state={state} />
      ) : (
        <WriteStep state={state} user={user} />
      )}
    </Modal>
  );
}
