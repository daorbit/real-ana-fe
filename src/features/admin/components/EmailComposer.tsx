import { Modal, Text, Alert, Loader, Code, Center, Box } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { useEmailComposer } from "@/features/admin/useEmailComposer";
import { AudiencePicker } from "@/features/admin/components/email/AudiencePicker";
import { MessagePane } from "@/features/admin/components/email/MessagePane";
import type { AdminUser } from "@/shared/types";

/**
 * Admin-only: compose and send a message, either to a segment, to a list of
 * addresses typed by hand, or to one account.
 *
 * One screen, two columns. This was a two-step wizard — audience, then write —
 * which split the two decisions that inform each other: you choose a segment to
 * work out what to say, and you change your mind about the segment once you
 * have said it. Worse, the audience was invisible for the whole time you were
 * writing, so the expensive thing to get wrong was the one thing not on screen.
 *
 * Side by side, the recipient count is in view when Send is pressed, and
 * switching segments does not mean leaving the draft.
 *
 * This file is only the shell. State lives in `useEmailComposer`; each column
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
  const { single, status, statusLoading, busy, close } = state;

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={single ? `Message ${user?.name}` : "New message"}
      centered
      radius="lg"
      // Wide enough for two columns and a preview at something near the mail's
      // real width. A single-recipient send has no picker, so it stays narrow.
      size={single ? "lg" : "80rem"}
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
      ) : single ? (
        // One recipient: no choice to make, so the message gets the full width.
        <MessagePane state={state} />
      ) : (
        // Grid rather than flex: the audience column holds a fixed width and the
        // message takes the rest, and on a narrow screen the two stack with the
        // picker on top — which is the order the decisions happen in.
        <Box
          style={{
            display: "grid",
            gap: 28,
            gridTemplateColumns: "minmax(260px, 320px) minmax(0, 1fr)",
            alignItems: "start",
          }}
          className="email-composer-grid"
        >
          <AudiencePicker state={state} user={user} />
          <MessagePane state={state} />
        </Box>
      )}
    </Modal>
  );
}
