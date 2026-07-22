import { useEffect, useRef, useState } from "react";

/** Anything longer and a changing live metric would still be mid-count on the
 *  next poll, which reads as lag rather than motion. */
const DURATION = 700;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Counts from the previous value to `target` when it changes.
 *
 * Numbers that snap from one figure to another are easy to miss; counting draws
 * the eye to exactly the metric that moved. The first render lands on the value
 * directly — an entrance animation on every card at once is noise, not signal.
 */
export function useCountUp(target: number): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const frame = useRef(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      from.current = target;
      setValue(target);
      return;
    }

    if (from.current === target) return;

    if (prefersReducedMotion()) {
      from.current = target;
      setValue(target);
      return;
    }

    const start = performance.now();
    const origin = from.current;
    const delta = target - origin;
    from.current = target;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // easeOutCubic: fast off the mark, settling gently on the final figure.
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(origin + delta * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target]);

  return value;
}
