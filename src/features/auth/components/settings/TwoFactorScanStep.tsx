import { useState } from "react";
import { ActionIcon, CopyButton, Tooltip } from "@mantine/core";
import { Check, Copy } from "lucide-react";
import { SecureDialogButton, SecureDialogLink } from "../SecureDialog";
import { formatSecret, type TotpSetup } from "./twoFactorSetup";
import classes from "./TwoFactorSetup.module.css";

export function TwoFactorScanStep({
  setup,
  onContinue,
}: {
  setup: TotpSetup;
  onContinue: () => void;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <>
      <div className={classes.qrFrame}>
        <img src={setup.qrDataUrl} alt="QR code for your authenticator app" className={classes.qr} />
      </div>

      {showKey ? (
        <div className={classes.keyRow}>
          <code className={classes.keyValue} translate="no">{formatSecret(setup.secret)}</code>
          <CopyButton value={setup.secret} timeout={1500}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "Copied" : "Copy key"} withArrow>
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={copy} aria-label="Copy key">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </div>
      ) : (
        <SecureDialogLink onClick={() => setShowKey(true)}>Can't scan it? Enter a key instead</SecureDialogLink>
      )}

      <SecureDialogButton data-autofocus onClick={onContinue}>
        Continue
      </SecureDialogButton>
    </>
  );
}
