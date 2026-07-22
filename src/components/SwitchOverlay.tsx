import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./SwitchOverlay.css";

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
 * The animation itself, without the self-dismiss timer. Use this where the
 * overlay should stay up until real work finishes (app boot) rather than for a
 * fixed beat.
 */
export function SwitchVisual({
  label,
  sublabel,
  loop = false,
  inline = false,
}: {
  label?: string;
  sublabel?: string;
  /** Repeat the animation instead of playing once and fading out. */
  loop?: boolean;
  /** Fill the parent instead of covering the viewport. */
  inline?: boolean;
}) {
  // Bar heights are fixed rather than random so the animation is identical on
  // every switch — a shape the eye learns instead of noise.
  const bars = [34, 58, 44, 76, 52, 90, 66, 40];
  // Trend line drawn in a 220x96 viewBox, matching the bar rhythm above it.
  const points = [
    [6, 74], [36, 56], [66, 63], [96, 34], [126, 47], [156, 18], [186, 30], [214, 12],
  ] as const;
  const path = points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const area = `${path} L214 96 L6 96 Z`;

  return (
    <div
      className="switch-overlay"
      data-loop={loop || undefined}
      data-inline={inline || undefined}
      role="status"
      aria-live="polite"
    >
      <div className="switch-overlay__grid" aria-hidden />
      <div className="switch-overlay__sweep" aria-hidden />
      <div className="switch-overlay__glow" aria-hidden />

      {/* Drifting motes read as live events arriving. Positions are fixed so
          the composition is the same every time. */}
      <div className="switch-overlay__motes" aria-hidden>
        {[12, 27, 41, 58, 66, 79, 88].map((left, i) => (
          <span
            key={left}
            style={{
              left: `${left}%`,
              animationDelay: `${i * 240}ms`,
              animationDuration: `${2600 + i * 260}ms`,
            }}
          />
        ))}
      </div>

      <div className="switch-overlay__body">
        <div className="switch-overlay__stage" aria-hidden>
          {/* Concentric rings pulse outward from the chart, like a live ping. */}
          <span className="switch-overlay__ring" />
          <span className="switch-overlay__ring" style={{ animationDelay: "420ms" }} />
          <span className="switch-overlay__ring" style={{ animationDelay: "840ms" }} />

          <div className="switch-overlay__bars">
            {bars.map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%`, animationDelay: `${i * 55}ms` }}
              />
            ))}
          </div>

          {/* Trend line strokes itself on over the bars, with a dot riding the
              end of the stroke. */}
          <svg
            className="switch-overlay__line"
            viewBox="0 0 220 96"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="sw-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="switch-overlay__area" d={area} fill="url(#sw-area)" />
            <path
              className="switch-overlay__stroke"
              d={path}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {points.map(([x, y], i) => (
              <circle
                key={i}
                className="switch-overlay__dot"
                cx={x}
                cy={y}
                r="3"
                fill="currentColor"
                style={{ animationDelay: `${180 + i * 70}ms` }}
              />
            ))}
          </svg>
        </div>

        {label && <p className="switch-overlay__label">{label}</p>}
        {sublabel && <p className="switch-overlay__sub">{sublabel}</p>}

        {/* Indeterminate progress rail — gives the eye something moving during
            the wait without implying a known percentage. */}
        <div className="switch-overlay__rail" aria-hidden>
          <span />
        </div>
      </div>
    </div>
  );
}

/**
 * Fires the overlay whenever `key` changes — but not on first mount, where
 * there is no transition to cover.
 */
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
