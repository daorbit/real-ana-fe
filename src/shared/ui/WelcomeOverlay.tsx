import { useState } from "react";
import { createPortal } from "react-dom";
import { Lottie } from "lottie-react";
import welcomeAnimation from "@/assets/banners/Welcome.json";
import "@/shared/ui/WelcomeOverlay.css";

const HOLD_AFTER_FINISH = 900;

export function WelcomeOverlay({ name, onDone }: { name?: string; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);


  const finish = () => {
    setLeaving(true);
    setTimeout(onDone, 400);
  };

  return createPortal(
    <div className="welcome-overlay" data-leaving={leaving || undefined} role="status" aria-live="polite">
      <div className="welcome-overlay__body">
        <Lottie
          src={welcomeAnimation}
          loop={false}
          autoplay
          subscriptions={{ complete: () => setTimeout(finish, HOLD_AFTER_FINISH) }}
          className="welcome-overlay__art"
          aria-hidden
        />
        <h1 className="welcome-overlay__title">
          {name ? `Welcome, ${name}.` : "Welcome."}
        </h1>
        <p className="welcome-overlay__sub">Your workspace is ready.</p>
        <div className="welcome-overlay__progress" aria-hidden>
          <span />
        </div>
      </div>
    </div>,
    document.body
  );
}
