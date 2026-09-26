import { useState } from "react";
import {
  ActionIcon, Alert, Button, Group, Modal, PasswordInput, PinInput, Stack, Text,
} from "@mantine/core";
import { KeyRound, Lock, LockKeyhole, LockKeyholeOpen, X } from "lucide-react";
import { SettingsCard } from "./SettingsCard";
import { StatusBadge } from "./StatusBadge";
import { ConfirmIdentityField } from "./ConfirmIdentityField";
import { identityProof, identityPrompt } from "./identityProof";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";
import lockBannerSrc from "@/assets/banners/lock-inactivity-banner.svg";
import pinBannerSrc from "@/assets/banners/change-pin-banner.svg";

/**
 * Turning the lock on needs a PIN set first, unless 2FA already covers
 * unlocking — same rule the server enforces in `/me/screen-lock/enable`, kept
 * here too so the form asks for the PIN instead of just failing after submit.
 */
export function ScreenLockPanel() {
  const { user, enableScreenLock, disableScreenLock, lockScreenNow, setPin } = useAuth();
  const [locking, setLocking] = useState(false);

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
    setDisableError(null);
    try {
      await disableScreenLock(identityProof(user, disablePassword));
      setDisableOpen(false);
      setDisablePassword("");
      notify.success("Screen lock turned off.", "Security");
    } catch (err) {
      setDisableError(errMessage(err, user.hasPassword ? "Incorrect password." : "Incorrect PIN or code."));
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
    <>
      <SettingsCard
        icon={LockKeyhole}
        title="Lock on inactivity"
        badge={<StatusBadge on={Boolean(user.screenLockEnabled)} />}
        description={`Show a lock screen after 5 minutes without activity. Unlock with ${
          user.hasPin && user.totpEnabled
            ? "your PIN or your authenticator app"
            : user.totpEnabled
              ? "your authenticator app"
              : "your PIN"
        }.${user.screenLockEnabled ? " Use “Lock now” to try it." : ""}`}
        action={
          user.screenLockEnabled ? (
            <Group gap="xs" wrap="nowrap">
              <Button
                variant="default"
                leftSection={<Lock size={15} />}
                loading={locking}
                onClick={() => void lockNow()}
              >
                Lock now
              </Button>
              <Button variant="default" leftSection={<KeyRound size={15} />} onClick={() => setPinOpen(true)}>
                {user.hasPin ? "Change PIN" : "Set a PIN"}
              </Button>
              <Button
                variant="default"
                color="red"
                leftSection={<LockKeyholeOpen size={15} />}
                onClick={() => setDisableOpen(true)}
              >
                Turn off
              </Button>
            </Group>
          ) : (
            <Button leftSection={<LockKeyhole size={15} />} onClick={openEnable}>
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
        radius="lg"
        size={440}
        centered
        padding={0}
        withCloseButton={false}
      >
        <Stack gap={0} className="verify-card" pos="relative">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => setDisableOpen(false)}
            aria-label="Close"
            style={{ position: "absolute", top: 14, right: 14, zIndex: 10 }}
          >
            <X size={16} style={{ pointerEvents: "none", color: "#fff" }} />
          </ActionIcon>
          <div
            style={{
              height: 154,
              backgroundImage: `url(${lockBannerSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <Stack gap="md" p={26}>
            <Text size="sm" c="dimmed">
              {identityPrompt(user)} to turn off the screen lock for this account.
            </Text>
            {disableError && <Alert color="red" variant="light">{disableError}</Alert>}
            <ConfirmIdentityField
              user={user}
              value={disablePassword}
              onChange={setDisablePassword}
              onSubmit={() => void disable()}
            />
            <Button color="red" loading={disabling} disabled={!disablePassword.trim()} onClick={() => void disable()}>
              Turn off
            </Button>
          </Stack>
        </Stack>
      </Modal>

      <Modal
        opened={pinOpen}
        onClose={() => setPinOpen(false)}
        radius="lg"
        size={440}
        centered
        padding={0}
        withCloseButton={false}
      >
        <Stack gap={0} className="verify-card" pos="relative">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => setPinOpen(false)}
            aria-label="Close"
            style={{ position: "absolute", top: 14, right: 14, zIndex: 10 }}
          >
            <X size={16} style={{ pointerEvents: "none", color: "#fff" }} />
          </ActionIcon>
          <div
            style={{
              height: 154,
              backgroundImage: `url(${pinBannerSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <Stack gap="md" p={26}>
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
        </Stack>
      </Modal>
    </>
  );
}
