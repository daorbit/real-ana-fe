import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "@/shared/ui/SwitchOverlay.css";

/** How long the overlay stays up, in ms. Matches the CSS animation budget. */
const DURATION = 950;

/**
 * Full-screen transition shown when the active workspace (or site scope)
 * changes. It is purely decorative: it never blocks the data fetch underneath,
 * it just covers the moment where every panel on the page swaps its numbers at
 * once, which otherwise reads as a flicker.
 */
export function SwitchOverlay({
  label,
  sublabel,
  onDone,
}: {
  label: string;
  sublabel?: string;
  onDone: () => void;
}) {
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const t = setTimeout(() => done.current(), DURATION);
    return () => clearTimeout(t);
  }, []);

  return createPortal(
    <SwitchVisual label={label} sublabel={sublabel} />,
    document.body
  );
}

/**
 * The loading mark: the "Quantalog" wordmark — the real brand — with its
 * trailing accent dot tracing a small orbit, over a thin rule that sweeps a
 * bright segment left to right. Pure CSS; only transform and opacity animate.
 */
function LoaderMark() {
  return (
    <div className="switch-overlay__mark" aria-hidden>
      <div className="switch-overlay__wordmark">
        <span className="switch-overlay__word">Quantalog</span>
        <span className="switch-overlay__dot" />
      </div>
      <div className="switch-overlay__rule">
        <span />
      </div>
    </div>
  );
}

/**
 * A plain, centred loading state — the animated mark and one or two lines of
 * text on a solid ground. Used for the app-boot hold, the workspace switch,
 * and anywhere a full-surface wait needs covering.
 */
export function SwitchVisual({
  label,
  sublabel,
  loop = false,
  inline = false,
}: {
  label?: string;
  sublabel?: string;
  loop?: boolean;
  inline?: boolean;
}) {
  return (
    <div
      className="switch-overlay"
      data-loop={loop || undefined}
      data-inline={inline || undefined}
      role="status"
      aria-live="polite"
    >
      <div className="switch-overlay__body">
        <LoaderMark />
        {label && <p className="switch-overlay__label">{label}</p>}
        {sublabel && <p className="switch-overlay__sub">{sublabel}</p>}
      </div>
    </div>
  );
}

 
export function useSwitchOverlay(key: string | null | undefined) {
  const [active, setActive] = useState(false);
  const prev = useRef(key);

  useEffect(() => {
    if (prev.current === key) return;
    prev.current = key;
    if (key == null) return;
    setActive(true);
  }, [key]);

  return { active, dismiss: () => setActive(false) };
}
