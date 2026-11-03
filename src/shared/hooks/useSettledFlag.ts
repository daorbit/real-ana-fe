import { useEffect, useState } from "react";

export function useSettledFlag(active: boolean, showAfterMs = 250, hideAfterMs = 300): boolean {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (active === on) return;
    const id = window.setTimeout(() => setOn(active), active ? showAfterMs : hideAfterMs);
    return () => window.clearTimeout(id);
  }, [active, on, showAfterMs, hideAfterMs]);

  return on;
}
