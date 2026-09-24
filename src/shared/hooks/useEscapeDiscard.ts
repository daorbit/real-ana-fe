import { useEffect } from "react";

export function useEscapeDiscard(active: boolean, discard: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.querySelector('[role="listbox"], [role="dialog"]')) return;
      e.preventDefault();
      discard();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, discard]);
}
