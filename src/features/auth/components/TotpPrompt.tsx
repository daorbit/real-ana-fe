import { useRef, useState } from "react";
import { TextInput } from "@mantine/core";
import { ShieldCheck } from "lucide-react";
import { errMessage, notify } from "@/shared/lib/notify";
import { SupportRequestModal } from "@/app/shell/SupportRequestModal";
import { CodeInput } from "./CodeInput";
import { SecureDialog, SecureDialogButton, SecureDialogLink, SecureDialogLinks } from "./SecureDialog";
import { useTrapSafeFocus } from "./useTrapSafeFocus";
import classes from "./SecureDialog.module.css";

export function TotpPrompt({
  opened,
  busy,
  onSubmit,
  onCancel,
}: {
  opened: boolean;
  busy: boolean;
  onSubmit: (code: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);
  const focusField = useTrapSafeFocus(useBackup ? backupRef : pinRef, opened);

  const submit = async (value = code) => {
    if (!value.trim()) return;
    try {
      await onSubmit(value.trim());
    } catch (err) {
      notify.error(errMessage(err, "That code didn't work. Try again."), "Two-step verification");
      if (!useBackup) setCode("");
      focusField();
    }
  };

  const switchMode = () => {
    setUseBackup((v) => !v);
    setCode("");
  };

  return (
    <>
      <SupportRequestModal opened={supportOpen} onClose={() => setSupportOpen(false)} />
      <SecureDialog
        opened={opened}
        onClose={onCancel}
        icon={ShieldCheck}
        title="Two-step verification"
        description={
          useBackup
            ? "Enter one of the backup codes you saved when you turned on two-factor authentication."
            : "Open your authenticator app and enter the 6-digit code for Quantalog."
        }
      >
        {useBackup ? (
          <TextInput
            ref={backupRef}
            placeholder="XXXX-XXXX"
            value={code}
            onChange={(e) => setCode(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && void submit()}
            disabled={busy}
            className={classes.textField}
          />
        ) : (
          <CodeInput
            ref={pinRef}
            length={6}
            value={code}
            onChange={setCode}
            onComplete={(value) => void submit(value)}
            disabled={busy}
          />
        )}

        <SecureDialogButton loading={busy} disabled={!code.trim()} onClick={() => void submit()}>
          Verify
        </SecureDialogButton>

        <SecureDialogLinks>
          <SecureDialogLink onClick={switchMode}>
            {useBackup ? "Use an authenticator code instead" : "Use a backup code instead"}
          </SecureDialogLink>
          <SecureDialogLink onClick={() => setSupportOpen(true)}>
            Lost access to both? Contact support
          </SecureDialogLink>
        </SecureDialogLinks>
      </SecureDialog>
    </>
  );
}
