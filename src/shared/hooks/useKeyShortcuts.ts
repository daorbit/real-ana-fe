import { useEffect, useRef } from "react";
import { SEQUENCE_MS, dialogOpen, isTyping } from "@/shared/lib/keyboard";

export function useKeyShortcuts(shortcuts: Record<string, () => void>, enabled = true) {
  const ref = useRef(shortcuts);
  ref.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;
    let pendingG = 0;

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (e.defaultPrevented || isTyping(e.target) || dialogOpen()) return;

      const key = e.key.toLowerCase();
      if (key === "g") {
        pendingG = Date.now();
        return;
      }
      if (pendingG && Date.now() - pendingG < SEQUENCE_MS) {
        pendingG = 0;
        return;
      }

      const run = ref.current[key];
      if (!run) return;
      e.preventDefault();
      run();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
