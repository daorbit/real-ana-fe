import { useState } from "react";
import { Alert, Box, Button, Group, PasswordInput, Stack, Text } from "@mantine/core";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";

 
export function PasswordPanel() {
  const { user, changePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const reset = () => {
    setOpen(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (user.hasPassword && !current) {
      setError("Enter your current password.");
      return;
    }
    if (next !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      await changePassword(next, user.hasPassword ? current : undefined);
      notify.success(
        user.hasPassword ? "Password changed." : "Password set — you can now log in with email too.",
        "Security"
      );
      reset();
    } catch (err) {
      setError(errMessage(err, "Could not update the password."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <div>
          <Text fw={600}>{user.hasPassword ? "Password" : "Set a password"}</Text>
          <Text size="sm" c="dimmed" mt={4}>
            {user.hasPassword
              ? "Change the password used to log in with email."
              : "This account signs in with Google or LinkedIn only. Set a password to also log in with email."}
          </Text>
        </div>

        {!open && (
          <Button variant="light" leftSection={<KeyRound size={15} />} onClick={() => setOpen(true)}>
            {user.hasPassword ? "Change" : "Set password"}
          </Button>
        )}
      </Group>

      {open && (
        <Stack gap="sm" mt="md" maw={360}>
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          {user.hasPassword && (
            <PasswordInput
              label="Current password"
              value={current}
              onChange={(e) => setCurrent(e.currentTarget.value)}
              disabled={busy}
            />
          )}
          <PasswordInput
            label="New password"
            value={next}
            onChange={(e) => setNext(e.currentTarget.value)}
            disabled={busy}
          />
          <PasswordInput
            label="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.currentTarget.value)}
            disabled={busy}
          />

          <Group gap="xs">
            <Button loading={busy} disabled={!next || !confirm} onClick={() => void submit()}>
              Save
            </Button>
            <Button variant="subtle" color="gray" disabled={busy} onClick={reset}>
              Cancel
            </Button>
          </Group>
        </Stack>
      )}
    </Box>
  );
}
