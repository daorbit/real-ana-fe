import { useState } from "react";
import {
  Button, Modal, PasswordInput, PinInput, Stack, Text,
} from "@mantine/core";
import { KeyRound, Lock, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { SecurityRow } from "./SecurityGroup";
import { StatusBadge } from "./StatusBadge";
import { SECURITY_ROW_IDS } from "./securityRows";
import { ConfirmIdentityField } from "./ConfirmIdentityField";
import { identityProof, identityPrompt } from "./identityProof";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";

export function ScreenLockPanel() {
  const { user, enableScreenLock, disableScreenLock, lockScreenNow, setPin } = useAuth();
  const [locking, setLocking] = useState(false);

  const [enableOpen, setEnableOpen] = useState(false);
  const [enablePin, setEnablePin] = useState("");
  const [enabling, setEnabling] = useState(false);

  const [disableOpen, setDisableOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);

  const [pinOpen, setPinOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);

  if (!user) return null;

  const needsPinToEnable = !user.totpEnabled && !user.hasPin;

  const openEnable = () => {
    setEnablePin("");
    setEnableOpen(true);
  };

  const confirmEnable = async () => {
    if (needsPinToEnable && enablePin.trim().length !== 4) return;
    setEnabling(true);
    try {
      await enableScreenLock(needsPinToEnable ? enablePin.trim() : undefined);
      setEnableOpen(false);
      notify.success("Screen lock turned on.", "Security");
    } catch (err) {
      notify.error(errMessage(err, "Could not turn on the screen lock."), "Security");
    } finally {
      setEnabling(false);
    }
  };

  const lockNow = async () => {
    setLocking(true);
    try {
      await lockScreenNow();
    } catch (err) {
      notify.error(errMessage(err, "Could not lock the screen."), "Security");
    } finally {
      setLocking(false);
    }
  };

  const disable = async () => {
    if (!disablePassword.trim()) return;
    setDisabling(true);
    try {
      await disableScreenLock(identityProof(user, disablePassword));
      setDisableOpen(false);
      setDisablePassword("");
      notify.success("Screen lock turned off.", "Security");
    } catch (err) {
      notify.error(errMessage(err, user.hasPassword ? "Incorrect password." : "Incorrect PIN or code."), "Security");
    } finally {
      setDisabling(false);
    }
  };

  const savePin = async () => {
    if (newPin.trim().length !== 4) return;
    setPinBusy(true);
    try {
      await setPin(newPin.trim(), user.hasPin ? currentPin.trim() : undefined);
      setPinOpen(false);
      setCurrentPin("");
      setNewPin("");
      notify.success(user.hasPin ? "PIN changed." : "PIN set.", "Security");
    } catch (err) {
      notify.error(errMessage(err, "Could not update the PIN."), "Security");
    } finally {
      setPinBusy(false);
    }
  };

  return (
    <>
      <SecurityRow
        id={SECURITY_ROW_IDS.screenLock}
        icon={LockKeyhole}
        hue="indigo"
        title="Lock on inactivity"
        status={<StatusBadge on={Boolean(user.screenLockEnabled)} />}
        description={`Locks the screen after 5 minutes without activity. Unlock with ${
          user.hasPin && user.totpEnabled
            ? "your PIN or your authenticator app"
            : user.totpEnabled
              ? "your authenticator app"
              : "your PIN"
        }.${user.screenLockEnabled ? " Use “Lock now” to try it." : ""}`}
        action={
          user.screenLockEnabled ? (
            <>
              <Button
                variant="default"
                radius="xl"
                leftSection={<Lock size={15} />}
                loading={locking}
                onClick={() => void lockNow()}
              >
                Lock now
              </Button>
              <Button variant="default" radius="xl" leftSection={<KeyRound size={15} />} onClick={() => setPinOpen(true)}>
                {user.hasPin ? "Change PIN" : "Set a PIN"}
              </Button>
              <Button
                variant="default"
                color="red"
                radius="xl"
                leftSection={<LockKeyholeOpen size={15} />}
                onClick={() => setDisableOpen(true)}
              >
                Turn off
              </Button>
            </>
          ) : (
            <Button radius="xl" leftSection={<LockKeyhole size={15} />} onClick={openEnable}>
              Turn on
            </Button>
          )
        }
      />

      <Modal
        opened={enableOpen}
        onClose={() => setEnableOpen(false)}
        title="Turn on lock on inactivity"
        radius="lg"
        size={400}
        centered
      >
        <Stack gap="lg" pt={4}>
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
        radius="lg"
        size={400}
        centered
      >
        <Stack gap="md" pt={4}>
          <Text size="sm" c="dimmed">
            {identityPrompt(user)} to turn off the screen lock for this account.
          </Text>
          <ConfirmIdentityField
            user={user}
            value={disablePassword}
            onChange={setDisablePassword}
            onSubmit={() => void disable()}
          />
          <Button fullWidth size="md" color="red" loading={disabling} disabled={!disablePassword.trim()} onClick={() => void disable()}>
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
    </>
  );
}
