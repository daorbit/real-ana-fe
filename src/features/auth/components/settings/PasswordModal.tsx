import { useState, type FormEvent } from "react";
import { Button, Modal, PasswordInput, Stack, Text } from "@mantine/core";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";

export function PasswordModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { user, changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const close = () => {
    if (busy) return;
    setCurrent("");
    setNext("");
    setConfirm("");
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (user.hasPassword && !current) {
      notify.error("Enter your current password.", "Password");
      return;
    }
    if (next !== confirm) {
      notify.error("Those passwords don't match.", "Password");
      return;
    }

    setBusy(true);
    try {
      await changePassword(next, user.hasPassword ? current : undefined);
      notify.success(
        user.hasPassword ? "Password changed." : "Password set — you can now log in with email too.",
        "Security"
      );
      setBusy(false);
      setCurrent("");
      setNext("");
      setConfirm("");
      onClose();
    } catch (err) {
      notify.error(errMessage(err, "Could not update the password."), "Password");
      setBusy(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={user.hasPassword ? "Change password" : "Set a password"}
      radius="lg"
      size={400}
      centered
    >
      <form onSubmit={(e) => void submit(e)}>
        <Stack gap="md" pt={4}>
          <Text size="sm" c="dimmed">
            {user.hasPassword
              ? "Other devices stay signed in. Sign them out below if you changed it for safety."
              : "Add a password so you can also log in with your email."}
          </Text>
          {user.hasPassword && (
            <PasswordInput
              label="Current password"
              value={current}
              onChange={(e) => setCurrent(e.currentTarget.value)}
              disabled={busy}
              autoComplete="current-password"
              data-autofocus
            />
          )}
          <PasswordInput
            label="New password"
            value={next}
            onChange={(e) => setNext(e.currentTarget.value)}
            disabled={busy}
            autoComplete="new-password"
            data-autofocus={!user.hasPassword || undefined}
          />
          <PasswordInput
            label="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.currentTarget.value)}
            disabled={busy}
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth size="md" loading={busy} disabled={!next || !confirm}>
            {user.hasPassword ? "Change password" : "Set password"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
