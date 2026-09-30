import confetti from "canvas-confetti";

const COLORS = ["#10b981", "#059669", "#34d399", "#fbbf24"];

export function celebrate() {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: COLORS });
  confetti({ particleCount: 60, spread: 100, startVelocity: 45, origin: { y: 0.5 }, colors: COLORS, angle: 60, decay: 0.9 });
  confetti({ particleCount: 60, spread: 100, startVelocity: 45, origin: { y: 0.5 }, colors: COLORS, angle: 120, decay: 0.9 });
}
