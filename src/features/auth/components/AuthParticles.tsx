import { useMemo } from "react";

/**
 * Drifting dot field behind the brand copy. Pure CSS animation on a handful of
 * absolutely-positioned spans — cheap enough to leave running, and it gives the
 * panel some depth without a canvas or a particles library.
 *
 * Positions are randomised once per mount so the field is never identical
 * between visits, but the animation itself is declarative.
 */
const COUNT = 34;

type Dot = {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

export function AuthParticles() {
  const dots = useMemo<Dot[]>(
    () =>
      Array.from({ length: COUNT }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        // A few larger, nearer dots among many small ones reads as depth.
        size: Math.random() < 0.18 ? 2.5 + Math.random() * 1.5 : 1 + Math.random(),
        delay: Math.random() * -18,
        duration: 14 + Math.random() * 16,
        opacity: 0.12 + Math.random() * 0.35,
      })),
    []
  );

  return (
    <div className="ab-particles" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
