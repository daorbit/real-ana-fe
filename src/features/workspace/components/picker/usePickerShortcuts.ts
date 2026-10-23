import { useEffect } from "react";

export const SHORTCUT_LIMIT = 9;

export function usePickerShortcuts(ids: string[], onPick: (id: string) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > Math.min(ids.length, SHORTCUT_LIMIT)) return;
      e.preventDefault();
      onPick(ids[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ids, onPick]);
}
