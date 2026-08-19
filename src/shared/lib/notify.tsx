import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { Text, TextInput, Group, Button, Stack, Code, Alert, ThemeIcon } from "@mantine/core";
import { TriangleAlert, ArrowUpCircle, Lock } from "lucide-react";
import { navigateTo } from "@/app/navigation";
import type { ReactNode } from "react";

export const notify = {
  success: (message: ReactNode, title = "Success") =>
    notifications.show({ title, message, color: "teal", autoClose: 3000 }),

  error: (message: ReactNode, title = "Something went wrong") =>
    notifications.show({ title, message, color: "red", autoClose: 5000 }),

  info: (message: ReactNode, title?: string) =>
    notifications.show({ title, message, color: "emerald", autoClose: 3000 }),

  /**
   * A plan/quota limit was hit (workspace, site, audit, crawl, or analytics
   * range caps). A centered dialog, not a toast — this is a decision the
   * reader needs to actually stop and consider ("upgrade?"), not a fire-and-
   * forget status update that's gone in five seconds. Routed through
   * Mantine's `modals` singleton, the same mechanism every other confirm
   * dialog in this file uses, so there's one dialog stack for the whole app
   * rather than a second ad hoc one per feature.
   */
  quotaLimit: (message: ReactNode) => {
    const id = "quota-limit";
    modals.open({
      modalId: id,
      centered: true,
      radius: "lg",
      size: "sm",
      withCloseButton: false,
      children: (
        <Stack align="center" gap="sm" py="sm">
          <ThemeIcon size={52} radius="xl" variant="light" color="emerald">
            <Lock size={22} />
          </ThemeIcon>
          <Text fw={650} size="lg" ta="center">Upgrade to unlock this</Text>
          <Text size="sm" c="dimmed" ta="center" maw={300}>{message}</Text>
          <Group mt="sm">
            <Button variant="subtle" color="gray" onClick={() => modals.close(id)}>
              Not now
            </Button>
            <Button
              color="emerald"
              leftSection={<ArrowUpCircle size={15} />}
              onClick={() => {
                modals.close(id);
                // Not <Link> — Mantine renders modal content as a sibling of
                // ModalsProvider's own children, so it sits outside App's
                // <BrowserRouter> and has no Router context to read a
                // client-side <Link> against. `navigateTo` reaches the
                // router's own `navigate` via a module-level handle instead
                // of falling back to a full-page reload.
                navigateTo("/app/billing");
              }}
            >
              Upgrade plan
            </Button>
          </Group>
        </Stack>
      ),
    });
  },
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

/**
 * The machine-readable `code` our API attaches to some errors — currently
 * just `"quota_exceeded"`, sent by the billing/workspace/site/SEO routes when
 * a plan limit is hit. Lets a caller branch on the failure kind instead of
 * pattern-matching the human message.
 */
export function errCode(e: unknown): string | undefined {
  if (typeof e !== "object" || e === null) return undefined;
  const err = e as { data?: unknown };
  if (typeof err.data !== "object" || err.data === null) return undefined;
  const code = (err.data as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

/**
 * `notify.error` for anything except a quota_exceeded error, which is
 * skipped here — the RTK Query `baseQuery` in `store/api.ts` already opens
 * `notify.quotaLimit` for every request that comes back with that code, so a
 * call site using this doesn't also need to check for it or risk a duplicate
 * toast stacked under the dialog.
 */
export function notifyError(e: unknown, fallback = "Request failed") {
  if (errCode(e) === "quota_exceeded") return;
  notify.error(errMessage(e, fallback));
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
  /**
   * Confirm button colour. Red by default, since deleting is what this mostly
   * guards — but it also covers actions that are merely irreversible rather
   * than destructive, and painting "Post now" red would misstate what it does.
   */
  confirmColor?: string;
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
      confirmProps: { color: opts.confirmColor ?? "red", loading: busy },
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
