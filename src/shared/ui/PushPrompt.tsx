import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { useGetNotificationPreferencesQuery } from "@/app/store";
import { usePush } from "@/features/activity/usePush";
import { readPushDismissal, writePushDismissal } from "./pushPromptDismissal";
import "./PushPrompt.css";

const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_AFTER_MS = 1500;

export function PushPrompt() {
  const { user } = useAuth();
  const { data } = useGetNotificationPreferencesQuery(undefined, { skip: !user });
  const { state, enable } = usePush(data?.vapidPublicKey ?? "", data?.pushConfigured ?? false);

  const [dismissal, setDismissal] = useState(() => readPushDismissal());
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (ready && state === "off") {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
  }, [ready, state]);

  if (!user || user.demo || user.impersonating) return null;
  if (!ready || state !== "off") return null;
  if (dismissal && dismissal.until > Date.now()) return null;

  const dismiss = (until: number) => {
    writePushDismissal({ until });
    setDismissal({ until });
  };

  return (
    <aside
      className="push-prompt"
      data-shown={shown || undefined}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        className="push-prompt__close"
        onClick={() => dismiss(Number.MAX_SAFE_INTEGER)}
        aria-label="Don't ask again"
      >
        <X size={13} strokeWidth={2} />
      </button>

      <div className="push-prompt__body">
        <Bell className="push-prompt__icon" size={17} strokeWidth={1.8} aria-hidden />
        <div className="push-prompt__text">
          <p className="push-prompt__title">Turn on notifications</p>
          <p className="push-prompt__detail">
            Know the moment something needs you, even with this tab closed.
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
        <button
          type="button"
          className="push-prompt__btn push-prompt__btn--primary"
          onClick={() => void enable()}
        >
          Allow
        </button>
      </div>
    </aside>
  );
}
