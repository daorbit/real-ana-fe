import { useEffect, useState } from "react";
import { useDemo } from "@/features/demo/context";

export function useDemoTick(enabled: boolean, intervalMs = 30_000): number {
  const { preview } = useDemo();
  const [tick, setTick] = useState(0);
  const live = enabled && !preview;

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setTick((t) => t + 1);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [live, intervalMs]);

  return tick;
}
