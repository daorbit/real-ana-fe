import { useEffect, useRef } from "react";
import { GO_MAP } from "@/shared/ui/palette/goShortcuts";

const SEQUENCE_MS = 1200;

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function dialogOpen(): boolean {
  return Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'));
}

export type PaletteHotkeyHandlers = {
  togglePalette: () => void;
  openShortcuts: () => void;
  openNotes: () => void;
  switchWorkspace: (index: number) => void;
  go: (to: string) => void;
};

export function usePaletteHotkeys(handlers: PaletteHotkeyHandlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    let pendingG = 0;

    const onKey = (e: KeyboardEvent) => {
      const h = ref.current;
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        h.togglePalette();
        return;
      }

      if (mod && !e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        h.switchWorkspace(Number(e.key) - 1);
        return;
      }

      if (mod || e.altKey || e.defaultPrevented || isTyping(e.target) || dialogOpen()) {
        pendingG = 0;
        return;
      }

      const key = e.key.toLowerCase();

      if (pendingG && Date.now() - pendingG < SEQUENCE_MS) {
        pendingG = 0;
        const target = GO_MAP.get(key);
        if (target) {
          e.preventDefault();
          h.go(target.to);
        }
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        h.openShortcuts();
      } else if (key === "g" && !e.shiftKey) {
        pendingG = Date.now();
      } else if (key === "n" && !e.shiftKey) {
        e.preventDefault();
        h.openNotes();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
