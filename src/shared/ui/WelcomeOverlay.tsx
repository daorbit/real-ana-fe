import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import welcomeSrc from "@/assets/banners/Welcome.svg";
import "@/shared/ui/WelcomeOverlay.css";

export const WELCOME_PENDING_KEY = "quantalog_welcome_pending";

const DURATION = 3800;

export function consumeWelcomePending(): boolean {
  try {
    if (localStorage.getItem(WELCOME_PENDING_KEY) !== "1") return false;
    localStorage.removeItem(WELCOME_PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}

export function WelcomeOverlay({ name, onDone }: { name?: string; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveAt = setTimeout(() => setLeaving(true), DURATION - 400);
    const doneAt = setTimeout(onDone, DURATION);
    return () => {
      clearTimeout(leaveAt);
      clearTimeout(doneAt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="welcome-overlay" data-leaving={leaving || undefined} role="status" aria-live="polite">
      <div className="welcome-overlay__body">
        <img src={welcomeSrc} alt="" className="welcome-overlay__art" aria-hidden />
        <h1 className="welcome-overlay__title">
          {name ? `Welcome, ${name}.` : "Welcome."}
        </h1>
        <p className="welcome-overlay__sub">Your workspace is ready.</p>
      </div>
    </div>,
    document.body
  );
}
