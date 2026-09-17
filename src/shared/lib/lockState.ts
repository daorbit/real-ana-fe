/**
 * One place that decides when the screen-lock overlay is showing.
 *
 * The server is the source of truth (`user.lockedAt`, enforced by
 * `requireUnlocked` on every data route) — this module just mirrors that into
 * the UI. A 423 from any request, or the idle timer firing, calls `showLock`;
 * a successful `/api/auth/unlock` calls `hideLock`. Plain subscribe/notify
 * rather than React context, since this needs to be reachable from the
 * non-component fetch layer (`http.ts`, `api.ts`) the same way
 * `handleSessionExpired` is.
 */

type Listener = (locked: boolean) => void;

let locked = false;
const listeners = new Set<Listener>();

export function showLock() {
  if (locked) return;
  locked = true;
  listeners.forEach((l) => l(true));
}

export function hideLock() {
  if (!locked) return;
  locked = false;
  listeners.forEach((l) => l(false));
}

export function isLocked(): boolean {
  return locked;
}

export function subscribeLock(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
