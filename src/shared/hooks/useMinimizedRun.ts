import { useCallback, useEffect, useRef, useState } from "react";

const SUCCESS_HOLD = 2600;

export function useMinimizedRun(running: boolean) {
  const [minimized, setMinimized] = useState(false);
  const [done, setDone] = useState(false);
  const wasRunning = useRef(false);

  useEffect(() => {
    if (running) {
      if (!wasRunning.current) {
        wasRunning.current = true;
        setMinimized(false);
        setDone(false);
      }
      return;
    }
    if (!wasRunning.current) return;
    wasRunning.current = false;
    if (!minimized) return;
    setDone(true);
    const id = setTimeout(() => {
      setDone(false);
      setMinimized(false);
    }, SUCCESS_HOLD);
    return () => clearTimeout(id);
  }, [running, minimized]);

  const minimize = useCallback(() => setMinimized(true), []);
  const restore = useCallback(() => setMinimized(false), []);

  return {
    expanded: running && !minimized,
    showPill: (running && minimized) || done,
    done,
    minimize,
    restore,
  };
}
