import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { subscribeLock, isLocked } from "@/shared/lib/lockState";
import { errMessage, notify } from "@/shared/lib/notify";
import { SupportRequestModal } from "@/app/shell/SupportRequestModal";
import { CodeInput } from "./CodeInput";
import { SecureDialog, SecureDialogButton, SecureDialogLink, SecureDialogLinks } from "./SecureDialog";
import { useTrapSafeFocus } from "./useTrapSafeFocus";

const CODE_LENGTH = { pin: 4, totp: 6 } as const;

export function LockScreen() {
  const { user, unlockScreen } = useAuth();
  const [visible, setVisible] = useState(isLocked());
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"pin" | "totp">(user?.totpEnabled ? "totp" : "pin");
  const [supportOpen, setSupportOpen] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);
  const focusCode = useTrapSafeFocus(codeRef, visible, mode);

  useEffect(() => subscribeLock(setVisible), []);

  useEffect(() => {
    if (visible) {
      setCode("");
      setMode(user?.totpEnabled ? "totp" : "pin");
    }
  }, [visible, user?.totpEnabled]);

  if (!visible || !user) return null;

  const submit = async (value = code) => {
    if (value.trim().length !== CODE_LENGTH[mode]) return;
    setBusy(true);
    try {
      await unlockScreen(mode === "pin" ? { pin: value.trim() } : { totpCode: value.trim() });
      setCode("");
    } catch (err) {
      notify.error(errMessage(err, "That didn't work. Try again."), "Screen lock");
      setCode("");
      focusCode();
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "pin" ? "totp" : "pin"));
    setCode("");
  };

  return (
    <>
      <SupportRequestModal opened={supportOpen} onClose={() => setSupportOpen(false)} />
      <SecureDialog
        icon={Lock}
        title="Welcome back"
        description={`Enter your ${mode === "pin" ? "PIN" : "authenticator code"} to pick up where you left off.`}
        contentKey={mode}
      >
        <CodeInput
          ref={codeRef}
          length={CODE_LENGTH[mode]}
          mask={mode === "pin"}
          value={code}
          onChange={setCode}
          onComplete={(value) => void submit(value)}
          disabled={busy}
        />

        <SecureDialogButton
          loading={busy}
          disabled={code.trim().length !== CODE_LENGTH[mode]}
          onClick={() => void submit()}
        >
          Unlock
        </SecureDialogButton>

        <SecureDialogLinks>
          {user.totpEnabled && user.hasPin && (
            <SecureDialogLink onClick={switchMode}>
              {mode === "pin" ? "Use an authenticator code instead" : "Use your PIN instead"}
            </SecureDialogLink>
          )}
          <SecureDialogLink onClick={() => setSupportOpen(true)}>
            Lost your PIN or authenticator? Contact support
          </SecureDialogLink>
        </SecureDialogLinks>
      </SecureDialog>
    </>
  );
}
