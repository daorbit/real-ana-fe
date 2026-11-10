import { useEffect, useState } from "react";

export function useDemoTick(enabled: boolean, intervalMs = 30_000): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setTick((t) => t + 1);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);

  return tick;
}
