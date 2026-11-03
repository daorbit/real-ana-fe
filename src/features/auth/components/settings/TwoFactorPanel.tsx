import { useState } from "react";
import { Button, Modal, Stack, Text } from "@mantine/core";
import { ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import { SecurityRow } from "./SecurityGroup";
import { StatusBadge } from "./StatusBadge";
import { SECURITY_ROW_IDS } from "./securityRows";
import { ConfirmIdentityField } from "./ConfirmIdentityField";
import { identityProof, identityPrompt } from "./identityProof";
import { TwoFactorSetupModal } from "./TwoFactorSetupModal";
import type { TotpSetup } from "./twoFactorSetup";
import { api } from "@/shared/lib/http";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";

export function TwoFactorPanel() {
  const { user, refreshUser } = useAuth();
  const [starting, setStarting] = useState(false);
  const [setup, setSetup] = useState<TotpSetup | null>(null);

  const [disableOpen, setDisableOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);

  if (!user) return null;

  const startSetup = async () => {
    setStarting(true);
    try {
      setSetup(await api.post<TotpSetup>("/api/auth/2fa/setup", {}));
    } catch (err) {
      notify.error(errMessage(err, "Could not start setup."), "Two-factor authentication");
    } finally {
      setStarting(false);
    }
  };

  const disable = async () => {
    if (!disablePassword.trim()) return;
    setDisabling(true);
    try {
      await api.post("/api/auth/2fa/disable", identityProof(user, disablePassword));
      setDisableOpen(false);
      setDisablePassword("");
      await refreshUser();
      notify.success("Two-factor authentication turned off.", "Security");
    } catch (err) {
      notify.error(errMessage(err, user.hasPassword ? "Incorrect password." : "Incorrect PIN or code."), "Security");
    } finally {
      setDisabling(false);
    }
  };

  return (
    <>
      <SecurityRow
        id={SECURITY_ROW_IDS.twoFactor}
        icon={Smartphone}
        hue="blue"
        title="Two-factor authentication"
        status={<StatusBadge on={Boolean(user.totpEnabled)} />}
        description="A code from your authenticator app, like Google Authenticator or 1Password, every time you log in."
        action={
          user.totpEnabled ? (
            <Button
              variant="default"
              color="red"
              radius="xl"
              leftSection={<ShieldOff size={15} />}
              onClick={() => setDisableOpen(true)}
            >
              Turn off
            </Button>
          ) : (
            <Button radius="xl" leftSection={<ShieldCheck size={15} />} loading={starting} onClick={startSetup}>
              Turn on
            </Button>
          )
        }
      />

      <TwoFactorSetupModal
        key={setup?.secret ?? "idle"}
        setup={setup}
        onClose={() => setSetup(null)}
        onEnabled={refreshUser}
      />

      <Modal
        opened={disableOpen}
        onClose={() => setDisableOpen(false)}
        title="Turn off two-factor authentication"
        radius="lg"
        size={400}
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {identityPrompt(user)} to turn off two-factor authentication for this account.
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
    </>
  );
}
