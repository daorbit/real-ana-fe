import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { Text, TextInput, Group, Button, Stack, Code, Alert, ThemeIcon } from "@mantine/core";
import { TriangleAlert, ArrowUpCircle, Lock } from "lucide-react";
import { navigateTo } from "@/app/navigation";
import type { ReactNode } from "react";

/**
 * Collapse a burst of identical toasts into one.
 *
 * A network flap fails five in-flight requests at once, each raising the same
 * red bar — a stack of five copies of one message reads as five separate
 * problems. Keyed on `color + title + message`, so genuinely different toasts
 * still stack; a repeat inside the window is dropped, and a repeat after it
 * shows again (the condition is still live).
 */
const DEDUPE_MS = 4000;
const recent = new Map<string, number>();

function showDeduped(opts: Parameters<typeof notifications.show>[0]) {
  const key = `${opts?.color ?? ""}|${String(opts?.title ?? "")}|${String(opts?.message ?? "")}`;
  const now = Date.now();
  const last = recent.get(key);
  if (last && now - last < DEDUPE_MS) return;
  recent.set(key, now);
  // Keep the map from growing without bound in a long session.
  if (recent.size > 50) {
    for (const [k, t] of recent) if (now - t > DEDUPE_MS) recent.delete(k);
  }
  notifications.show(opts);
}

/**
 * What the server says about the cap that was hit, when it says anything.
 *
 * Every field is optional: the dialog works from the message alone, and a route
 * that has not been taught to send this yet still opens the same dialog rather
 * than falling back to a red toast.
 */
export interface QuotaLimitInfo {
  /** Machine name of the cap — `forms`, `sites`, `audits`, `orbit_questions`. */
  kind?: string;
  /** Human name for the heading: "Forms", "Scheduled posts", "Orbit questions". */
  label?: string;
  used?: number;
  quota?: number;
  plan?: string;
}

export const notify = {
  /**
   * `emerald` rather than a literal colour: that is the alias the theme
   * remaps onto whichever accent the user picked, so a success toast is their
   * colour. A fixed `teal` here left a green bar on a crimson theme.
   */
  success: (message: ReactNode, title = "Success") =>
    showDeduped({ title, message, color: "emerald", autoClose: 3000 }),

  error: (message: ReactNode, title = "Something went wrong") =>
    showDeduped({ title, message, color: "red", autoClose: 5000 }),

  info: (message: ReactNode, title?: string) =>
    showDeduped({ title, message, color: "emerald", autoClose: 3000 }),

  /**
   * A plan/quota limit was hit (workspace, site, audit, crawl, or analytics
   * range caps). A centered dialog, not a toast — this is a decision the
   * reader needs to actually stop and consider ("upgrade?"), not a fire-and-
   * forget status update that's gone in five seconds. Routed through
   * Mantine's `modals` singleton, the same mechanism every other confirm
   * dialog in this file uses, so there's one dialog stack for the whole app
   * rather than a second ad hoc one per feature.
   */
  quotaLimit: (message: ReactNode, limit?: QuotaLimitInfo) => {
    const id = "quota-limit";
    // The heading names what ran out when the server said so. "You've used all
    // your forms" tells the reader which cap they hit; the generic line leaves
    // them to infer it from the sentence below.
    const heading = limit?.label
      ? `You've reached your ${limit.label} limit`
      : "Upgrade to unlock this";
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
          <Text fw={650} size="lg" ta="center">{heading}</Text>
          <Text size="sm" c="dimmed" ta="center" maw={300}>{message}</Text>
          {typeof limit?.used === "number" && typeof limit?.quota === "number" && (
            <Text size="xs" c="dimmed" ta="center">
              {limit.used} of {limit.quota} used on the {limit.plan ?? "current"} plan
            </Text>
          )}
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
 * The error codes that mean "your plan stops you here", as opposed to a bug or
 * a bad request. `quota_exceeded` is an allowance used up; `plan_required` is a
 * feature the plan never included. Both end at the same upgrade dialog — the
 * reader's next step is identical — so both are matched wherever one is.
 */
const PLAN_LIMIT_CODES = ["quota_exceeded", "plan_required"];

export function isPlanLimit(e: unknown): boolean {
  const code = errCode(e);
  return code !== undefined && PLAN_LIMIT_CODES.includes(code);
}

/** The `limit` block a plan-limit response carries, when the route sends one. */
export function quotaLimitInfo(e: unknown): QuotaLimitInfo | undefined {
  if (typeof e !== "object" || e === null) return undefined;
  const data = (e as { data?: unknown }).data;
  if (typeof data !== "object" || data === null) return undefined;
  const limit = (data as { limit?: unknown }).limit;
  if (typeof limit !== "object" || limit === null) return undefined;
  return limit as QuotaLimitInfo;
}

/**
 * `notify.error` for anything except a plan-limit error, which is
 * skipped here — the RTK Query `baseQuery` in `store/api.ts` already opens
 * `notify.quotaLimit` for every request that comes back with that code, so a
 * call site using this doesn't also need to check for it or risk a duplicate
 * toast stacked under the dialog.
 */
export function notifyError(e: unknown, fallback = "Request failed") {
  if (isPlanLimit(e)) return;
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

/** The body of `confirmDelete`, split out so it can own the busy state. */
function ConfirmForm({
  body,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: {
  body: ReactNode;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (busy) return;
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
      <Group justify="flex-end" gap="sm">
        <Button variant="default" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button color={confirmColor} onClick={run} loading={busy}>
          {confirmLabel}
        </Button>
      </Group>
    </Stack>
  );
}

/**
 * Destructive confirmation dialog.
 *
 * Built on `modals.open` rather than `openConfirmModal`: the latter closes the
 * moment confirm is clicked and ignores whatever `onConfirm` returns, so an
 * async handler ran invisibly — the dialog vanished while the request was
 * still in flight and the row changed some time later, with nothing on screen
 * saying anything was happening.
 *
 * Here the body owns the busy state, so the dialog stays put with the confirm
 * button spinning until the promise settles, and both buttons are disabled in
 * between so the request cannot be fired twice.
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

  modals.open({
    modalId: id,
    title: opts.title,
    centered: true,
    radius: "lg",
    children: (
      <ConfirmForm
        body={opts.body}
        confirmLabel={opts.confirmLabel ?? "Delete"}
        confirmColor={opts.confirmColor ?? "red"}
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
