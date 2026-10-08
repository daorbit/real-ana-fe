import { useSyncExternalStore } from "react";

export type FavouriteDashboard = { id: string; name: string };

const PREFIX = "quantalog.favDashboards";
export const MAX_FAVOURITES = 8;
const EMPTY: FavouriteDashboard[] = [];
const listeners = new Set<() => void>();
const cache = new Map<string, FavouriteDashboard[]>();

const keyFor = (workspaceId: string) => `${PREFIX}:${workspaceId}`;

function read(workspaceId: string): FavouriteDashboard[] {
  const cached = cache.get(workspaceId);
  if (cached) return cached;
  let list: FavouriteDashboard[] = EMPTY;
  try {
    const raw = JSON.parse(localStorage.getItem(keyFor(workspaceId)) ?? "[]");
    if (Array.isArray(raw)) {
      list = raw.filter(
        (f): f is FavouriteDashboard => f && typeof f.id === "string" && typeof f.name === "string",
      );
    }
  } catch {
    list = EMPTY;
  }
  cache.set(workspaceId, list);
  return list;
}

function write(workspaceId: string, list: FavouriteDashboard[]) {
  cache.set(workspaceId, list);
  try {
    localStorage.setItem(keyFor(workspaceId), JSON.stringify(list));
  } catch {
    return;
  } finally {
    listeners.forEach((l) => l());
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (!e.key?.startsWith(PREFIX)) return;
    cache.clear();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function isFavourite(workspaceId: string, id: string): boolean {
  return read(workspaceId).some((f) => f.id === id);
}

export function toggleFavourite(workspaceId: string, dashboard: FavouriteDashboard): boolean {
  const list = read(workspaceId);
  if (list.some((f) => f.id === dashboard.id)) {
    write(workspaceId, list.filter((f) => f.id !== dashboard.id));
    return false;
  }
  if (list.length >= MAX_FAVOURITES) return false;
  write(workspaceId, [...list, { id: dashboard.id, name: dashboard.name }]);
  return true;
}

export function removeFavourite(workspaceId: string, id: string) {
  const list = read(workspaceId);
  if (list.some((f) => f.id === id)) write(workspaceId, list.filter((f) => f.id !== id));
}

export function syncFavouriteName(workspaceId: string, id: string, name: string) {
  const list = read(workspaceId);
  if (list.some((f) => f.id === id && f.name !== name)) {
    write(workspaceId, list.map((f) => (f.id === id ? { ...f, name } : f)));
  }
}

export function useFavouriteDashboards(workspaceId: string | undefined): FavouriteDashboard[] {
  return useSyncExternalStore(
    subscribe,
    () => (workspaceId ? read(workspaceId) : EMPTY),
    () => EMPTY,
  );
}
