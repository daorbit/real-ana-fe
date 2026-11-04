import { useRef, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { api } from "@/shared/lib/http";
import { errMessage, notify } from "@/shared/lib/notify";
import { CodeInput } from "../CodeInput";
import { SecureDialog, SecureDialogButton, SecureDialogLink } from "../SecureDialog";
import { useTrapSafeFocus } from "../useTrapSafeFocus";
import { TwoFactorBackupCodes } from "./TwoFactorBackupCodes";
import { TwoFactorScanStep } from "./TwoFactorScanStep";
import type { TotpSetup } from "./twoFactorSetup";

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
  const [step, setStep] = useState<"scan" | "verify">("scan");
  const [code, setCode] = useState("");
  const [enabling, setEnabling] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const codeRef = useRef<HTMLInputElement>(null);
  const focusCode = useTrapSafeFocus(codeRef, step === "verify");

  const done = backupCodes.length > 0;
  const opened = setup !== null;

  const confirm = async (value = code) => {
    if (!setup || value.trim().length !== 6) return;
    setEnabling(true);
    try {
      const r = await api.post<EnableResp>("/api/auth/2fa/enable", {
        secret: setup.secret,
        code: value.trim(),
      });
      setBackupCodes(r.backupCodes);
      await onEnabled();
    } catch (err) {
      notify.error(errMessage(err, "That code didn't match. Try the next one."), "Two-factor authentication");
      setCode("");
      focusCode();
    } finally {
      setEnabling(false);
    }
  };

  if (done) {
    return (
      <SecureDialog
        opened={opened}
        onClose={onClose}
        icon={KeyRound}
        eyebrow="Step 3 of 3"
        title="Save your backup codes"
        description="Two-factor is on. Each code works once if you lose your authenticator. We've emailed them to you too, and they won't be shown here again."
        size={440}
        closeOnClickOutside={false}
        contentKey="done"
      >
        <TwoFactorBackupCodes codes={backupCodes} onDone={onClose} />
      </SecureDialog>
    );
  }

  if (step === "scan") {
    return (
      <SecureDialog
        opened={opened}
        onClose={onClose}
        eyebrow="Step 1 of 3"
        title="Scan this QR code"
        description="Open Google Authenticator, 1Password or any authenticator app, add an account, and point your camera at the code."
        size={440}
        contentKey="scan"
      >
        {setup && <TwoFactorScanStep setup={setup} onContinue={() => setStep("verify")} />}
      </SecureDialog>
    );
  }

  return (
    <SecureDialog
      opened={opened}
      onClose={onClose}
      icon={ShieldCheck}
      eyebrow="Step 2 of 3"
      title="Enter the 6-digit code"
      description="Type the code your authenticator app shows for Quantalog. It refreshes every 30 seconds."
      size={440}
      closeOnClickOutside={!enabling}
      contentKey="verify"
    >
      <CodeInput
        ref={codeRef}
        length={6}
        oneTimeCode
        value={code}
        onChange={setCode}
        onComplete={(value) => void confirm(value)}
        disabled={enabling}
      />
      <SecureDialogButton
        loading={enabling}
        disabled={code.trim().length !== 6}
        onClick={() => void confirm()}
      >
        Verify and turn on
      </SecureDialogButton>
      <SecureDialogLink onClick={() => { setCode(""); setStep("scan"); }}>
        Back to the QR code
      </SecureDialogLink>
    </SecureDialog>
  );
}
