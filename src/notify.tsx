import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { Text, TextInput, Group, Button, Stack, Code, Alert } from "@mantine/core";
import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

export const notify = {
  success: (message: ReactNode, title = "Success") =>
    notifications.show({ title, message, color: "teal", autoClose: 3000 }),

  error: (message: ReactNode, title = "Something went wrong") =>
    notifications.show({ title, message, color: "red", autoClose: 5000 }),

  info: (message: ReactNode, title?: string) =>
    notifications.show({ title, message, color: "emerald", autoClose: 3000 }),
};

/**
 * Turns an unknown thrown value into a readable message.
 *
 * Handles plain Errors as well as RTK Query's rejection shape, which is an
 * object like `{ status: 404, data: { error: "site not found" } }` rather than
 * an Error instance.
 */
export function errMessage(e: unknown, fallback = "Request failed"): string {
  if (e instanceof Error) return e.message;

  if (typeof e === "object" && e !== null) {
    const err = e as { data?: unknown; error?: unknown; status?: unknown };

    // Our API returns { error: "..." } on failure.
    if (typeof err.data === "object" && err.data !== null) {
      const msg = (err.data as { error?: unknown }).error;
      if (typeof msg === "string" && msg) return msg;
    }
    if (typeof err.data === "string" && err.data) return err.data;

    // Network / parsing failures surface as { error: "..." }.
    if (typeof err.error === "string" && err.error) return err.error;
  }

  return fallback;
}

// Neutral confirmation (e.g. logging out).
export function confirmLogout(onConfirm: () => void) {
  modals.openConfirmModal({
    title: "Log out?",
    centered: true,
    radius: "lg",
    children: <Text size="sm" c="dimmed">You'll need to sign in again to see your analytics.</Text>,
    labels: { confirm: "Log out", cancel: "Stay" },
    confirmProps: { color: "emerald" },
    onConfirm,
  });
}

/**
 * Destructive confirmation dialog.
 *
 * `openConfirmModal` closes as soon as confirm is clicked and ignores whatever
 * `onConfirm` returns, so an async handler would run invisibly: the dialog
 * disappears while the request is still in flight and the row only changes
 * some time later. Instead the modal is opened with an explicit id, held open
 * on confirm, and closed once the promise settles — with the confirm button
 * showing a loading state in between, and both buttons disabled so the request
 * cannot be fired twice.
 */
export function confirmDelete(opts: {
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const id = `confirm-delete-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const open = (busy: boolean) =>
    modals.openConfirmModal({
      modalId: id,
      title: opts.title,
      centered: true,
      radius: "lg",
      // While the request is in flight the outcome is not decided yet, so the
      // dialog must not be dismissable by escape, overlay click or the X.
      closeOnClickOutside: !busy,
      closeOnEscape: !busy,
      withCloseButton: !busy,
      children: <Text size="sm" c="dimmed">{opts.body}</Text>,
      labels: { confirm: opts.confirmLabel ?? "Delete", cancel: "Cancel" },
      confirmProps: { color: "red", loading: busy },
      cancelProps: { disabled: busy },
      onConfirm: () => {
        const result = opts.onConfirm();

        // Synchronous handler: nothing to wait for, let it close normally.
        if (!(result instanceof Promise)) return;

        // Re-open with the same id to swap in the loading state. Mantine
        // replaces the existing modal rather than stacking a second one.
        open(true);
        // The call sites report their own errors; this only has to make sure
        // the dialog closes either way rather than hanging open on rejection.
        result.catch(() => undefined).finally(() => modals.close(id));
      },
    });

  open(false);
}

/** The body of `confirmDestroy`, split out so it can hold the typed input. */
function DestroyForm({
  phrase,
  body,
  consequences,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  phrase: string;
  body: ReactNode;
  consequences: string[];
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  // Case-insensitive: the point is deliberate acknowledgement, not a typing
  // test, and a name with capitals shouldn't make this harder than it is.
  const matches = typed.trim().toLowerCase() === phrase.toLowerCase();

  const run = async () => {
    if (!matches || busy) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">{body}</Text>

      <Alert
        color="red"
        variant="light"
        radius="md"
        icon={<TriangleAlert size={16} />}
        title="This cannot be undone"
      >
        <Stack gap={4} mt={4}>
          {consequences.map((c) => (
            <Text key={c} size="xs">• {c}</Text>
          ))}
        </Stack>
      </Alert>

      <div>
        <Text size="sm" mb={6}>
          Type <Code>{phrase}</Code> to confirm.
        </Text>
        <TextInput
          data-autofocus
          value={typed}
          placeholder={phrase}
          onChange={(e) => setTyped(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void run();
            }
          }}
          disabled={busy}
          autoComplete="off"
          spellCheck={false}
          aria-label={`Type ${phrase} to confirm`}
        />
      </div>

      <Group justify="flex-end" gap="sm">
        <Button variant="default" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button color="red" onClick={run} disabled={!matches} loading={busy}>
          {confirmLabel}
        </Button>
      </Group>
    </Stack>
  );
}

/**
 * Confirmation for an action that destroys data no backup will bring back.
 *
 * `confirmDelete` is right for anything recoverable or small. This one is for
 * the cases where a mis-click costs history that cannot be re-collected — it
 * lists exactly what goes, and requires the name to be typed out, so confirming
 * is a deliberate act rather than a reflex on a familiar dialog.
 */
export function confirmDestroy(opts: {
  title: string;
  /** The exact text that must be typed — normally the thing's own name. */
  phrase: string;
  body: ReactNode;
  /** Bullet list of what is lost. Be specific; this is the whole point. */
  consequences: string[];
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const id = `confirm-destroy-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  modals.open({
    modalId: id,
    title: opts.title,
    centered: true,
    radius: "lg",
    children: (
      <DestroyForm
        phrase={opts.phrase}
        body={opts.body}
        consequences={opts.consequences}
        confirmLabel={opts.confirmLabel ?? "Delete"}
        onCancel={() => modals.close(id)}
        onConfirm={async () => {
          // Call sites report their own errors; this only has to close the
          // dialog once the request settles either way.
          try {
            await opts.onConfirm();
          } finally {
            modals.close(id);
          }
        }}
      />
    ),
  });
}
