import { useEffect, useRef } from "react";
import { api } from "@/shared/lib/http";
import { showLock, isLocked } from "@/shared/lib/lockState";

const IDLE_MS = 5 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

/**
 * Watches for 5 minutes of inactivity and asks the server to lock the
 * account. The overlay that actually blocks the UI comes up off the server's
 * own signal (a 423 on the next request, handled in http.ts/api.ts) or
 * straight off this call's response — either way the lock itself lives in the
 * database via `/api/auth/lock`, not in this timer, so a tab that never fires
 * this effect (backgrounded, devtools-throttled, or with this code stripped
 * out) still finds every other route locked.
 */
export function useIdleLock(enabled: boolean) {
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const bump = () => { lastActivity.current = Date.now(); };
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, bump, { passive: true }));

    const interval = setInterval(() => {
      if (isLocked()) return;
      if (Date.now() - lastActivity.current >= IDLE_MS) {
        api.post<{ ok: boolean; locked?: boolean }>("/api/auth/lock", {})
          .then((r) => { if (r.locked) showLock(); })
          .catch(() => { /* the next request's 423 will catch it if this fails */ });
      }
    }, 15_000);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, bump));
      clearInterval(interval);
    };
  }, [enabled]);
}
