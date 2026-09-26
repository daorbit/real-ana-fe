import { useState } from "react";
import { ActionIcon, Button, CopyButton, Modal, PinInput, Text, Tooltip } from "@mantine/core";
import { Check, Copy, Download, KeyRound, ShieldCheck, X } from "lucide-react";
import { api } from "@/shared/lib/http";
import { errMessage } from "@/shared/lib/notify";
import bannerSrc from "@/assets/banners/totp-setup-banner.svg";
import { TwoFactorSetupSteps } from "./TwoFactorSetupSteps";
import { downloadBackupCodes, formatSecret, type TotpSetup } from "./twoFactorSetup";
import classes from "./TwoFactorSetup.module.css";

type EnableResp = { backupCodes: string[] };

export function TwoFactorSetupModal({
  setup,
  onClose,
  onEnabled,
}: {
  setup: TotpSetup | null;
  onClose: () => void;
  onEnabled: () => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [enabling, setEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const done = backupCodes.length > 0;
  const activeStep = done ? 2 : code.length > 0 ? 1 : 0;

  const confirm = async (value = code) => {
    if (!setup || value.trim().length !== 6) return;
    setEnabling(true);
    setError(null);
    try {
      const r = await api.post<EnableResp>("/api/auth/2fa/enable", {
        secret: setup.secret,
        code: value.trim(),
      });
      setBackupCodes(r.backupCodes);
      await onEnabled();
    } catch (err) {
      setError(errMessage(err, "That code didn't match — try the next one."));
      setCode("");
    } finally {
      setEnabling(false);
    }
  };

  return (
    <Modal
      opened={setup !== null}
      onClose={onClose}
      radius="lg"
      size={done ? 480 : 640}
      centered
      padding={0}
      withCloseButton={false}
      closeOnClickOutside={!enabling}
    >
      <div className="verify-card">
        <ActionIcon variant="subtle" color="gray" size="sm" onClick={onClose} aria-label="Close" className={classes.close}>
          <X size={16} />
        </ActionIcon>
        <img src={bannerSrc} alt="" className={classes.banner} />

        <div className={classes.body}>
          <TwoFactorSetupSteps active={activeStep} />

          {setup && !done && (
            <div className={classes.grid}>
              <div className={classes.qrColumn}>
                <div className={classes.qrFrame}>
                  <img src={setup.qrDataUrl} alt="QR code for your authenticator app" className={classes.qr} />
                </div>
                <Text size="xs" c="dimmed" className={classes.qrHint}>
                  Works with Google Authenticator, Microsoft Authenticator, 1Password and Authy.
                </Text>
              </div>

              <div className={classes.formColumn}>
                <div>
                  <Text fw={600} size="sm">Scan the QR code</Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Open your authenticator app, tap “Add account”, and point your camera at the code.
                  </Text>
                </div>

                <div className={classes.keyBox}>
                  <div className={classes.keyHead}>
                    <KeyRound size={13} />
                    <Text size="xs" fw={600}>Can't scan? Enter this key</Text>
                    <CopyButton value={setup.secret} timeout={1500}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? "Copied" : "Copy key"} withArrow>
                          <ActionIcon
                            variant="subtle"
                            color={copied ? "green" : "gray"}
                            size="sm"
                            onClick={copy}
                            aria-label="Copy key"
                            className={classes.keyCopy}
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </div>
                  <code className={classes.keyValue}>{formatSecret(setup.secret)}</code>
                </div>

                <div className={classes.divider} />

                <div>
                  <Text fw={600} size="sm">Enter the 6-digit code</Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    The code refreshes every 30 seconds.
                  </Text>
                </div>

                <PinInput
                  length={6}
                  type="number"
                  size="md"
                  oneTimeCode
                  value={code}
                  onChange={setCode}
                  onComplete={(value) => void confirm(value)}
                  error={Boolean(error)}
                  disabled={enabling}
                />
                {error && <Text size="xs" c="red">{error}</Text>}

                <Button
                  fullWidth
                  size="md"
                  leftSection={<ShieldCheck size={16} />}
                  loading={enabling}
                  disabled={code.trim().length !== 6}
                  onClick={() => void confirm()}
                >
                  Verify and turn on
                </Button>
              </div>
            </div>
          )}

          {done && (
            <>
              <div className={classes.success}>
                <span className={classes.successIcon}>
                  <Check size={18} />
                </span>
                <div>
                  <Text fw={650} size="sm">Two-factor authentication is on</Text>
                  <Text size="xs" c="dimmed">You'll be asked for a code each time you log in.</Text>
                </div>
              </div>

              <div>
                <Text fw={600} size="sm">Save your backup codes</Text>
                <Text size="xs" c="dimmed" mt={4}>
                  Each code works once if you lose access to your authenticator app. We've emailed
                  them to you too — they won't be shown here again.
                </Text>
              </div>

              <ol className={classes.codes}>
                {backupCodes.map((c) => (
                  <li key={c} className={classes.code}>{c}</li>
                ))}
              </ol>

              <div className={classes.actions}>
                <CopyButton value={backupCodes.join("\n")} timeout={1500}>
                  {({ copied, copy }) => (
                    <Button
                      variant="default"
                      color={copied ? "green" : undefined}
                      leftSection={copied ? <Check size={15} /> : <Copy size={15} />}
                      onClick={copy}
                    >
                      {copied ? "Copied" : "Copy all"}
                    </Button>
                  )}
                </CopyButton>
                <Button
                  variant="default"
                  leftSection={<Download size={15} />}
                  onClick={() => downloadBackupCodes(backupCodes)}
                >
                  Download
                </Button>
                <Button className={classes.done} onClick={onClose}>
                  I've saved them
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
