import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { Text } from "@mantine/core";
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
