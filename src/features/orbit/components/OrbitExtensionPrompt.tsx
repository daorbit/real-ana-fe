import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { pushSupported } from "@/features/activity/usePush";
import { readPushDismissal } from "@/shared/ui/pushPromptDismissal";
import { OrbitMark } from "./OrbitMark";
import {
  ORBIT_EXTENSION_URL,
  canInstallOrbitExtension,
  readOrbitExtensionDismissal,
  writeOrbitExtensionDismissal,
} from "../orbitExtension";
import "@/shared/ui/PushPrompt.css";
import classes from "./orbitExtensionPrompt.module.css";

const SHOW_AFTER_MS = 4000;
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

function pushPromptMayShow(): boolean {
  if (!pushSupported() || Notification.permission !== "default") return false;
  const d = readPushDismissal();
  return !d || d.until <= Date.now();
}

export function OrbitExtensionPrompt() {
  const { user } = useAuth();
  const [until, setUntil] = useState(() => readOrbitExtensionDismissal());
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(id);
  }, []);

  if (!user || user.demo || user.impersonating) return null;
  if (!shown || !canInstallOrbitExtension() || pushPromptMayShow()) return null;
  if (until && until > Date.now()) return null;

  const dismiss = (next: number) => {
    writeOrbitExtensionDismissal(next);
    setUntil(next);
  };

  return (
    <aside className="push-prompt" data-shown role="status" aria-live="polite">
      <button
        type="button"
        className="push-prompt__close"
        onClick={() => dismiss(Number.MAX_SAFE_INTEGER)}
        aria-label="Don't show again"
      >
        <X size={13} strokeWidth={2} />
      </button>

      <div className="push-prompt__body">
        <OrbitMark size={18} className={classes.mark} />
        <div className="push-prompt__text">
          <p className="push-prompt__title">Orbit AI is now on Chrome</p>
          <p className="push-prompt__detail">
            Ask Orbit from any tab in the side panel. Open it with Ctrl+Shift+O.
          </p>
        </div>
      </div>

      <div className="push-prompt__actions">
        <button
          type="button"
          className="push-prompt__btn push-prompt__btn--quiet"
          onClick={() => dismiss(Date.now() + SNOOZE_MS)}
        >
          Not now
        </button>
        <a
          href={ORBIT_EXTENSION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`push-prompt__btn push-prompt__btn--primary ${classes.link}`}
          onClick={() => dismiss(Number.MAX_SAFE_INTEGER)}
        >
          Add to Chrome
        </a>
      </div>
    </aside>
  );
}
