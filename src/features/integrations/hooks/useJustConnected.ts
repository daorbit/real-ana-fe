import { useEffect, useRef, useState } from "react";

const CELEBRATE_MS = 2600;

export function useJustConnected(connected: boolean): boolean {
  const previous = useRef(connected);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    const was = previous.current;
    previous.current = connected;
    if (!connected) {
      setCelebrating(false);
      return;
    }
    if (was) return;
    setCelebrating(true);
    const timer = window.setTimeout(() => setCelebrating(false), CELEBRATE_MS);
    return () => window.clearTimeout(timer);
  }, [connected]);

  return celebrating;
}
