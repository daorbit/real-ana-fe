import { useEffect, useState } from "react";

const START_DELAY = 350;
const PLACE_BUDGET = 1100;

export function useBuildProgress(opened: boolean, total: number) {
  const [phase, setPhase] = useState(0);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!opened) return;
    setPhase(0);
    setRevealed(0);

    let placed = 0;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      setPhase(1);
      if (total === 0) {
        setPhase(2);
        return;
      }
      interval = window.setInterval(() => {
        placed += 1;
        setRevealed(placed);
        if (placed >= total) {
          window.clearInterval(interval);
          setPhase(2);
        }
      }, Math.max(50, PLACE_BUDGET / total));
    }, START_DELAY);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [opened, total]);

  return { phase, revealed };
}
