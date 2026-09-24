import { useState } from "react";
import { Alert, Box, Button, Group, PasswordInput } from "@mantine/core";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";
import { SettingsCard } from "./SettingsCard";
import { StatusBadge } from "./StatusBadge";
import classes from "./Security.module.css";

 
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
    <SettingsCard
      icon={KeyRound}
      title={user.hasPassword ? "Password" : "Set a password"}
      badge={<StatusBadge on={Boolean(user.hasPassword)} onLabel="Set" offLabel="Not set" />}
      description={
        user.hasPassword
          ? "Change the password you use to log in with email."
          : "This account signs in with Google or LinkedIn only. Set a password to also log in with email."
      }
      action={
        !open && (
          <Button variant="default" onClick={() => setOpen(true)}>
            {user.hasPassword ? "Change password" : "Set password"}
          </Button>
        )
      }
    >
      {open && (
        <Box className={classes.form}>
          {error && (
            <Alert color="red" variant="light" className={classes.formFull}>
              {error}
            </Alert>
          )}

          {user.hasPassword && (
            <PasswordInput
              className={classes.formFull}
              label="Current password"
              value={current}
              onChange={(e) => setCurrent(e.currentTarget.value)}
              disabled={busy}
              autoComplete="current-password"
            />
          )}
          <PasswordInput
            label="New password"
            value={next}
            onChange={(e) => setNext(e.currentTarget.value)}
            disabled={busy}
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.currentTarget.value)}
            disabled={busy}
            autoComplete="new-password"
          />

          <Group gap="xs" className={classes.formFull}>
            <Button loading={busy} disabled={!next || !confirm} onClick={() => void submit()}>
              Save password
            </Button>
            <Button variant="subtle" color="gray" disabled={busy} onClick={reset}>
              Cancel
            </Button>
          </Group>
        </Box>
      )}
    </SettingsCard>
  );
}
