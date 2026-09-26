import { useState } from "react";
import {
  ActionIcon, Alert, Box, Button, Group, Modal, PinInput, Stack, Text,
} from "@mantine/core";
import { ShieldCheck, ShieldOff, Download, X, Smartphone } from "lucide-react";
import { SettingsCard } from "./SettingsCard";
import { StatusBadge } from "./StatusBadge";
import { ConfirmIdentityField } from "./ConfirmIdentityField";
import { identityProof, identityPrompt } from "./identityProof";
import { api } from "@/shared/lib/http";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";
import totpSetupBannerSrc from "@/assets/banners/totp-setup-banner.svg";

type SetupResp = { secret: string; qrDataUrl: string };
type EnableResp = { backupCodes: string[] };

/**
 * Three states in one modal, not three: "scan this", "confirm you scanned
 * it", and "here are your backup codes" are steps of a single setup attempt,
 * and closing the modal partway through should abandon all of it rather
 * than leave a half-configured secret sitting in the account.
 */
type SetupStep = "qr" | "codes";

export function TwoFactorPanel() {
  const { user, refreshUser } = useAuth();
  const [starting, setStarting] = useState(false);
  const [setup, setSetup] = useState<SetupResp | null>(null);
  const [step, setStep] = useState<SetupStep>("qr");
  const [code, setCode] = useState("");
  const [enabling, setEnabling] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [disableOpen, setDisableOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  if (!user) return null;

  const startSetup = async () => {
    setStarting(true);
    setError(null);
    try {
      const r = await api.post<SetupResp>("/api/auth/2fa/setup", {});
      setSetup(r);
      setStep("qr");
      setCode("");
    } catch (err) {
      notify.error(errMessage(err, "Could not start setup."), "Two-factor authentication");
    } finally {
      setStarting(false);
    }
  };

  const confirmSetup = async () => {
    if (!setup || code.trim().length !== 6) return;
    setEnabling(true);
    setError(null);
    try {
      const r = await api.post<EnableResp>("/api/auth/2fa/enable", {
        secret: setup.secret,
        code: code.trim(),
      });
      setBackupCodes(r.backupCodes);
      setStep("codes");
      await refreshUser();
    } catch (err) {
      setError(errMessage(err, "That code didn't match — try the next one."));
    } finally {
      setEnabling(false);
    }
  };

  const downloadBackupCodes = () => {
    const blob = new Blob(
      [
        "Quantalog two-factor backup codes\n",
        "Each code works once, in place of a code from your authenticator app.\n\n",
        backupCodes.join("\n"),
        "\n",
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quantalog-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const finishSetup = () => {
    setSetup(null);
    setBackupCodes([]);
    setCode("");
  };

  const disable = async () => {
    if (!disablePassword.trim()) return;
    setDisabling(true);
    setDisableError(null);
    try {
      await api.post("/api/auth/2fa/disable", identityProof(user, disablePassword));
      setDisableOpen(false);
      setDisablePassword("");
      await refreshUser();
      notify.success("Two-factor authentication turned off.", "Security");
    } catch (err) {
      setDisableError(errMessage(err, user.hasPassword ? "Incorrect password." : "Incorrect PIN or code."));
    } finally {
      setDisabling(false);
    }
  };

  return (
    <>
      <SettingsCard
        icon={Smartphone}
        title="Two-factor authentication"
        badge={<StatusBadge on={Boolean(user.totpEnabled)} />}
        description="Ask for a code from an authenticator app, like Google Authenticator or 1Password, every time you log in — with a password, Google or LinkedIn."
        action={
          user.totpEnabled ? (
            <Button
              variant="default"
              color="red"
              leftSection={<ShieldOff size={15} />}
              onClick={() => setDisableOpen(true)}
            >
              Turn off
            </Button>
          ) : (
            <Button leftSection={<ShieldCheck size={15} />} loading={starting} onClick={startSetup}>
              Turn on
            </Button>
          )
        }
      />

      <Modal
        opened={setup !== null}
        onClose={finishSetup}
        radius="lg"
        size={setup && step === "qr" ? 620 : 440}
        centered
        padding={0}
        withCloseButton={false}
      >
        <Stack gap={0} className="verify-card" pos="relative">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={finishSetup}
            aria-label="Close"
            style={{ position: "absolute", top: 14, right: 14, zIndex: 10 }}
          >
            <X size={16} style={{ pointerEvents: "none", color: "#fff" }} />
          </ActionIcon>
          <div
            style={{
              height: 154,
              backgroundImage: `url(${totpSetupBannerSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <Box p={26}>
            {setup && step === "qr" && (
              <Group align="flex-start" gap="xl" wrap="nowrap">
                {/* Left: the thing you scan once. Right: the thing you type
                    every time after — separating them reads as two steps
                    instead of one long stack the eye has to scan top to
                    bottom to find the input. */}
                <Stack gap="sm" align="center" style={{ flexShrink: 0 }}>
                  <img src={setup.qrDataUrl} alt="Scan with your authenticator app" width={180} height={180} />
                </Stack>

                <Stack gap="md" style={{ flex: 1 }}>
                  <Text size="sm" c="dimmed">
                    Scan the code with your authenticator app, then enter the 6-digit code it shows.
                  </Text>

                  {error && <Alert color="red" variant="light">{error}</Alert>}

                  <PinInput
                    length={6}
                    type="number"
                    value={code}
                    onChange={setCode}
                    onComplete={() => void confirmSetup()}
                    disabled={enabling}
                  />
                  <Button loading={enabling} disabled={code.trim().length !== 6} onClick={() => void confirmSetup()}>
                    Confirm and turn on
                  </Button>

                  <Text size="xs" c="dimmed">
                    Can't scan it? Enter this key instead:{" "}
                    <Text span style={{ wordBreak: "break-all", fontFamily: "monospace" }}>
                      {setup.secret}
                    </Text>
                  </Text>
                </Stack>
              </Group>
            )}

            {step === "codes" && (
              <Stack gap="md">
                <Alert color="teal" variant="light">
                  Two-factor authentication is on.
                </Alert>
                <Text size="sm" c="dimmed">
                  Save these backup codes somewhere safe. Each works once, in place of a code from
                  your app, if you lose access to it. They won't be shown again.
                </Text>
                <Box className="totp-backup-codes" style={{
                  fontFamily: "monospace", background: "var(--mantine-color-default-hover)",
                  borderRadius: 8, padding: 12, display: "grid",
                  gridTemplateColumns: "1fr 1fr", gap: 8,
                }}>
                  {backupCodes.map((c) => <span key={c}>{c}</span>)}
                </Box>
                <Button
                  variant="light"
                  leftSection={<Download size={15} />}
                  onClick={downloadBackupCodes}
                >
                  Download codes
                </Button>
                <Button onClick={finishSetup}>Done</Button>
              </Stack>
            )}
          </Box>
        </Stack>
      </Modal>

      <Modal
        opened={disableOpen}
        onClose={() => setDisableOpen(false)}
        title="Turn off two-factor authentication"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {identityPrompt(user)} to turn off two-factor authentication for this account.
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
      </Modal>
    </>
  );
}
