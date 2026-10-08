import { useSyncExternalStore } from "react";

export type NavPrefs = { hidden: string[]; pinned: string[] };

const KEY = "quantalog.navPrefs";
const EMPTY: NavPrefs = { hidden: [], pinned: [] };
export const LOCKED_NAV_ITEMS = new Set(["/app", "/app/settings"]);

const listeners = new Set<() => void>();
let cache: NavPrefs | null = null;

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

function read(): NavPrefs {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    cache = raw
      ? {
          hidden: strings(raw.hidden).filter((to) => !LOCKED_NAV_ITEMS.has(to)),
          pinned: strings(raw.pinned),
        }
      : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: NavPrefs) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return;
  } finally {
    listeners.forEach((l) => l());
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export type NavItemState = "pinned" | "shown" | "hidden";

export function navItemState(prefs: NavPrefs, to: string): NavItemState {
  if (prefs.pinned.includes(to)) return "pinned";
  if (prefs.hidden.includes(to)) return "hidden";
  return "shown";
}

export function setNavItemState(to: string, state: NavItemState) {
  if (state === "hidden" && LOCKED_NAV_ITEMS.has(to)) return;
  const prefs = read();
  const hidden = prefs.hidden.filter((x) => x !== to);
  const pinned = prefs.pinned.filter((x) => x !== to);
  if (state === "hidden") hidden.push(to);
  if (state === "pinned") pinned.push(to);
  write({ hidden, pinned });
}

export function moveNavPinned(to: string, delta: -1 | 1) {
  const prefs = read();
  const from = prefs.pinned.indexOf(to);
  const target = from + delta;
  if (from < 0 || target < 0 || target >= prefs.pinned.length) return;
  const pinned = [...prefs.pinned];
  [pinned[from], pinned[target]] = [pinned[target], pinned[from]];
  write({ ...prefs, pinned });
}

export function resetNavPrefs() {
  write(EMPTY);
}

export function useNavPrefs(): NavPrefs {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
