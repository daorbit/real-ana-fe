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
    notifications.show({ title, message, color: "violet", autoClose: 3000 }),
};

// Turns an unknown thrown value into a readable message.
export function errMessage(e: unknown, fallback = "Request failed"): string {
  return e instanceof Error ? e.message : fallback;
}

// Neutral confirmation (e.g. logging out).
export function confirmLogout(onConfirm: () => void) {
  modals.openConfirmModal({
    title: "Log out?",
    centered: true,
    radius: "lg",
    children: <Text size="sm" c="dimmed">You'll need to sign in again to see your analytics.</Text>,
    labels: { confirm: "Log out", cancel: "Stay" },
    confirmProps: { color: "violet" },
    onConfirm,
  });
}

// Destructive confirmation dialog.
export function confirmDelete(opts: {
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  modals.openConfirmModal({
    title: opts.title,
    centered: true,
    radius: "lg",
    children: <Text size="sm" c="dimmed">{opts.body}</Text>,
    labels: { confirm: opts.confirmLabel ?? "Delete", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onConfirm: opts.onConfirm,
  });
}
