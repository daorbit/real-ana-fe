import { readThemePrefs } from "@/shared/lib/theme";

const COLORS = ["#2f6bff", "#98b2ff", "#818cf8", "#34d399", "#fbbf24"];
const Z_INDEX = 1000;
const OPEN_DELAY_MS = 180;

function motionOff(): boolean {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) || !readThemePrefs().motion;
}

export function celebrate() {
  if (motionOff()) return;
  window.setTimeout(() => {
    void import("canvas-confetti").then(({ default: confetti }) => {
      const base = { colors: COLORS, zIndex: Z_INDEX, disableForReducedMotion: true };
      confetti({ ...base, particleCount: 90, spread: 70, origin: { y: 0.6 } });
      confetti({ ...base, particleCount: 60, spread: 100, startVelocity: 45, origin: { x: 0, y: 0.6 }, angle: 60, decay: 0.9 });
      confetti({ ...base, particleCount: 60, spread: 100, startVelocity: 45, origin: { x: 1, y: 0.6 }, angle: 120, decay: 0.9 });
    });
  }, OPEN_DELAY_MS);
}
