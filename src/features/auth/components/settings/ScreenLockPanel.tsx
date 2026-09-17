import { useState } from "react";
import {
  Alert, Badge, Box, Button, Group, Modal, PasswordInput, PinInput, Stack, Text,
} from "@mantine/core";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";

/**
 * Turning the lock on needs a PIN set first, unless 2FA already covers
 * unlocking — same rule the server enforces in `/me/screen-lock/enable`, kept
 * here too so the form asks for the PIN instead of just failing after submit.
 */
export function ScreenLockPanel() {
  const { user, enableScreenLock, disableScreenLock, setPin } = useAuth();

  const [enableOpen, setEnableOpen] = useState(false);
  const [enablePin, setEnablePin] = useState("");
  const [enabling, setEnabling] = useState(false);
  const [enableError, setEnableError] = useState<string | null>(null);

  const [disableOpen, setDisableOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  const [pinOpen, setPinOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  if (!user) return null;

  const needsPinToEnable = !user.totpEnabled && !user.hasPin;

  const openEnable = () => {
    setEnablePin("");
    setEnableError(null);
    setEnableOpen(true);
  };

  const confirmEnable = async () => {
    if (needsPinToEnable && enablePin.trim().length !== 4) return;
    setEnabling(true);
    setEnableError(null);
    try {
      await enableScreenLock(needsPinToEnable ? enablePin.trim() : undefined);
      setEnableOpen(false);
      notify.success("Screen lock turned on.", "Security");
    } catch (err) {
      setEnableError(errMessage(err, "Could not turn on the screen lock."));
    } finally {
      setEnabling(false);
    }
  };

  const disable = async () => {
    setDisabling(true);
    setDisableError(null);
    try {
      await disableScreenLock(disablePassword);
      setDisableOpen(false);
      setDisablePassword("");
      notify.success("Screen lock turned off.", "Security");
    } catch (err) {
      setDisableError(errMessage(err, "Incorrect password."));
    } finally {
      setDisabling(false);
    }
  };

  const savePin = async () => {
    if (newPin.trim().length !== 4) return;
    setPinBusy(true);
    setPinError(null);
    try {
      await setPin(newPin.trim(), user.hasPin ? currentPin.trim() : undefined);
      setPinOpen(false);
      setCurrentPin("");
      setNewPin("");
      notify.success(user.hasPin ? "PIN changed." : "PIN set.", "Security");
    } catch (err) {
      setPinError(errMessage(err, "Could not update the PIN."));
    } finally {
      setPinBusy(false);
    }
  };

  return (
    <Box>
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Group gap={8}>
            <Text fw={600}>Lock on inactivity</Text>
            {user.screenLockEnabled ? (
              <Badge color="teal" variant="light" size="sm">On</Badge>
            ) : (
              <Badge color="gray" variant="light" size="sm">Off</Badge>
            )}
          </Group>
          <Text size="sm" c="dimmed" mt={4}>
            Show a lock screen after 5 minutes of inactivity. Unlock with your PIN
            {user.totpEnabled ? " or your authenticator app" : ""}.
          </Text>
        </div>

        {user.screenLockEnabled ? (
          <Button
            variant="light"
            color="red"
            leftSection={<LockKeyholeOpen size={15} />}
            onClick={() => setDisableOpen(true)}
          >
            Turn off
          </Button>
        ) : (
          <Button variant="light" leftSection={<LockKeyhole size={15} />} onClick={openEnable}>
            Turn on
          </Button>
        )}
      </Group>

      {user.screenLockEnabled && (
        <Group mt="sm">
          <Button variant="subtle" size="xs" onClick={() => setPinOpen(true)}>
            {user.hasPin ? "Change PIN" : "Set a PIN"}
          </Button>
        </Group>
      )}

      <Modal
        opened={enableOpen}
        onClose={() => setEnableOpen(false)}
        title="Turn on lock on inactivity"
        radius="lg"
        size={400}
        centered
      >
        <Stack gap="lg" pt={4}>
          {enableError && <Alert color="red" variant="light">{enableError}</Alert>}
          {needsPinToEnable ? (
            <Stack gap="md" align="center">
              <Text size="sm" c="dimmed" ta="center">
                Set a 4-digit PIN. You'll enter it to unlock after being idle.
              </Text>
              <PinInput
                length={4}
                type="number"
                size="lg"
                radius="md"
                autoFocus
                value={enablePin}
                onChange={setEnablePin}
                onComplete={() => void confirmEnable()}
                disabled={enabling}
              />
            </Stack>
          ) : (
            <Text size="sm" c="dimmed">
              You'll unlock with a code from your authenticator app.
            </Text>
          )}
          <Button
            fullWidth
            size="md"
            loading={enabling}
            disabled={needsPinToEnable && enablePin.trim().length !== 4}
            onClick={() => void confirmEnable()}
          >
            Turn on
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={disableOpen}
        onClose={() => setDisableOpen(false)}
        title="Turn off lock on inactivity"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Confirm your password to turn off the screen lock for this account.
          </Text>
          {disableError && <Alert color="red" variant="light">{disableError}</Alert>}
          <PasswordInput
            placeholder="Current password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && void disable()}
          />
          <Button color="red" loading={disabling} disabled={!disablePassword} onClick={() => void disable()}>
            Turn off
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={pinOpen}
        onClose={() => setPinOpen(false)}
        title={user.hasPin ? "Change PIN" : "Set a PIN"}
        radius="lg"
        size={400}
        centered
      >
        <Stack gap="md" pt={4}>
          {pinError && <Alert color="red" variant="light">{pinError}</Alert>}
          {user.hasPin && (
            <PasswordInput
              label="Current PIN"
              maxLength={4}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.currentTarget.value)}
              disabled={pinBusy}
            />
          )}
          <PasswordInput
            label="New PIN (4 digits)"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.currentTarget.value)}
            disabled={pinBusy}
          />
          <Button fullWidth size="md" loading={pinBusy} disabled={newPin.trim().length !== 4} onClick={() => void savePin()}>
            Save
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
}
