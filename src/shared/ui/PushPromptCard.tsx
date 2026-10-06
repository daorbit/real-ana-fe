import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useGetNotificationPreferencesQuery } from "@/app/store";
import { usePush } from "@/features/activity/usePush";
import { writePushDismissal, type PushDismissal } from "./pushPromptDismissal";
import "./PushPrompt.css";

const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

export function PushPromptCard({ onDismiss }: { onDismiss: (d: PushDismissal) => void }) {
  const { data } = useGetNotificationPreferencesQuery();
  const { state, enable } = usePush(data?.vapidPublicKey ?? "", data?.pushConfigured ?? false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (state !== "off") return;
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [state]);

  if (state !== "off") return null;

  const dismiss = (until: number) => {
    writePushDismissal({ until });
    onDismiss({ until });
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
