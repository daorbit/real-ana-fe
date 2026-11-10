import { Fragment, useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { ACCOUNT_LOCKED_FORM_URL } from "@/shared/lib/formLinks";
import { FormModal } from "@/shared/ui/FormModal";
import { SecureDialog, SecureDialogLink } from "./SecureDialog";
import classes from "./AccountLockedDialog.module.css";

function remainingParts(ms: number): { value: string; unit: string }[] {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts = [{ value: pad(h), unit: "hours" }, { value: pad(m), unit: "min" }, { value: pad(s), unit: "sec" }];
  return h > 0 ? parts : parts.slice(1);
}

export function AccountLockedDialog({
  lockedUntil,
  onClose,
}: {
  lockedUntil: Date | null;
  onClose: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  if (!lockedUntil) return null;

  const remaining = lockedUntil.getTime() - now;
  if (remaining <= 0) {
    onClose();
    return null;
  }

  const parts = remainingParts(remaining);

  return (
    <SecureDialog
      onClose={onClose}
      icon={ShieldAlert}
      title="Account locked"
      description="Too many sign-in attempts. Sign-in is paused to keep your account safe."
    >
      <div className={classes.countdown}>
        {parts.map((p, i) => (
          <Fragment key={p.unit}>
            {i > 0 && <span className={classes.separator}>:</span>}
            <span className={classes.unit}>
              <span className={classes.value}>{p.value}</span>
              <span className={classes.label}>{p.unit}</span>
            </span>
          </Fragment>
        ))}
      </div>

      <p className={classes.note}>
        If this wasn't you, someone else may know your password. Change it once the lock lifts.
      </p>

      <div className={classes.help}>
        <span className={classes.helpText}>Locked out by mistake?</span>
        <SecureDialogLink onClick={() => setHelpOpen(true)}>Contact support</SecureDialogLink>
      </div>

      <FormModal
        opened={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Request assistance"
        url={ACCOUNT_LOCKED_FORM_URL}
      />
    </SecureDialog>
  );
}
