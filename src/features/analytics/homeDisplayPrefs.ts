import { useSyncExternalStore } from "react";

export type HomeDisplayPrefs = { hero: boolean; greeting: boolean };

const KEY = "quantalog.homeDisplay";
const DEFAULTS: HomeDisplayPrefs = { hero: true, greeting: true };

const listeners = new Set<() => void>();
let cache: HomeDisplayPrefs | null = null;

function read(): HomeDisplayPrefs {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    cache = raw
      ? { hero: raw.hero !== false, greeting: raw.greeting !== false }
      : DEFAULTS;
  } catch {
    cache = DEFAULTS;
  }
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setHomeDisplay(patch: Partial<HomeDisplayPrefs>) {
  cache = { ...read(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    return;
  } finally {
    listeners.forEach((l) => l());
  }
}

export function useHomeDisplay(): HomeDisplayPrefs {
  return useSyncExternalStore(subscribe, read, () => DEFAULTS);
}
