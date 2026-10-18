import { useEffect, useRef, useSyncExternalStore } from "react";

type Entry = { id: number; open: () => void };

let current: Entry | null = null;
let nextId = 0;
const listeners = new Set<() => void>();

function setCurrent(value: Entry | null) {
  current = value;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRegisterHeaderHelp(open: (() => void) | null) {
  const latest = useRef(open);
  latest.current = open;
  const enabled = open !== null;

  useEffect(() => {
    if (!enabled) return;
    const id = ++nextId;
    setCurrent({ id, open: () => latest.current?.() });
    return () => {
      if (current?.id === id) setCurrent(null);
    };
  }, [enabled]);
}

export function useHeaderHelp(): (() => void) | null {
  return useSyncExternalStore(subscribe, () => current?.open ?? null);
}
