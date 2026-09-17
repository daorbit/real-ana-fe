import { useState } from "react";
import {
  Alert, Badge, Box, Button, Group, Modal, PasswordInput, PinInput, Stack, Text,
} from "@mantine/core";
import { ShieldCheck, ShieldOff, Download } from "lucide-react";
import { api } from "@/shared/lib/http";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";

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
    setDisabling(true);
    setDisableError(null);
    try {
      await api.post("/api/auth/2fa/disable", { password: disablePassword });
      setDisableOpen(false);
      setDisablePassword("");
      await refreshUser();
      notify.success("Two-factor authentication turned off.", "Security");
    } catch (err) {
      setDisableError(errMessage(err, "Incorrect password."));
    } finally {
      setDisabling(false);
    }
  };

  return (
    <Box>
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Group gap={8}>
            <Text fw={600}>Two-factor authentication</Text>
            {user.totpEnabled ? (
              <Badge color="teal" variant="light" size="sm">On</Badge>
            ) : (
              <Badge color="gray" variant="light" size="sm">Off</Badge>
            )}
          </Group>
          <Text size="sm" c="dimmed" mt={4}>
            Require a code from an authenticator app when logging in with a password.
          </Text>
        </div>

        {user.totpEnabled ? (
          <Button
            variant="light"
            color="red"
            leftSection={<ShieldOff size={15} />}
            onClick={() => setDisableOpen(true)}
          >
            Turn off
          </Button>
        ) : (
          <Button
            variant="light"
            leftSection={<ShieldCheck size={15} />}
            loading={starting}
            onClick={startSetup}
          >
            Turn on
          </Button>
        )}
      </Group>

      <Modal opened={setup !== null} onClose={finishSetup} title="Set up two-factor authentication" centered>
        {setup && step === "qr" && (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Scan this with your authenticator app, then enter the 6-digit code it shows.
            </Text>
            <Box style={{ textAlign: "center" }}>
              <img src={setup.qrDataUrl} alt="Scan with your authenticator app" width={200} height={200} />
            </Box>
            <Text size="xs" c="dimmed" ta="center">
              Can't scan it? Enter this key instead: <code>{setup.secret}</code>
            </Text>

            {error && <Alert color="red" variant="light">{error}</Alert>}

            <PinInput
              length={6}
              type="number"
              value={code}
              onChange={setCode}
              onComplete={() => void confirmSetup()}
              disabled={enabling}
              styles={{ root: { justifyContent: "center" } }}
            />
            <Button loading={enabling} disabled={code.trim().length !== 6} onClick={() => void confirmSetup()}>
              Confirm and turn on
            </Button>
          </Stack>
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
      </Modal>

      <Modal
        opened={disableOpen}
        onClose={() => setDisableOpen(false)}
        title="Turn off two-factor authentication"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Confirm your password to turn off two-factor authentication for this account.
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
    </Box>
  );
}
