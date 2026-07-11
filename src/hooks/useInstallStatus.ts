import { useCallback, useEffect, useRef, useState } from "react";
import { useGetInstallStatusQuery, useLazyGetInstallStatusQuery } from "../store";

export type InstallPhase = "idle" | "listening" | "installed" | "not-found";

const LISTEN_MS = 30_000; // how long we wait for the customer to load their site
const POLL_MS = 2_000;

/** Whether a site has ever reported an event. Cached per site. */
export function useSiteInstalled(workspaceId: string, siteId: string) {
  const { data } = useGetInstallStatusQuery({ workspaceId, siteId });
  return data ? data.installed : null;
}

/**
 * Drives the "is my snippet working?" checker: polls the install-status
 * endpoint for 30 seconds and resolves as soon as the first event lands.
 *
 * Uses the lazy query so the poll bypasses the cache — we specifically want a
 * fresh answer on every tick here.
 */
export function useInstallCheck(workspaceId: string, siteId: string, autoStart = false) {
  const [trigger] = useLazyGetInstallStatusQuery();

  const [phase, setPhase] = useState<InstallPhase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<{ poll?: number; tick?: number; giveUp?: number }>({});

  const stop = useCallback(() => {
    window.clearInterval(timers.current.poll);
    window.clearInterval(timers.current.tick);
    window.clearTimeout(timers.current.giveUp);
    timers.current = {};
  }, []);

  const check = useCallback(async (): Promise<boolean> => {
    try {
      const res = await trigger({ workspaceId, siteId }, false).unwrap();
      return res.installed;
    } catch {
      return false;
    }
  }, [trigger, workspaceId, siteId]);

  const start = useCallback(async () => {
    stop();
    setElapsed(0);
    setPhase("listening");

    // Already receiving traffic? Resolve immediately.
    if (await check()) {
      setPhase("installed");
      return;
    }

    timers.current.tick = window.setInterval(() => setElapsed((e) => e + 1), 1000);

    timers.current.poll = window.setInterval(async () => {
      if (await check()) {
        stop();
        setPhase("installed");
      }
    }, POLL_MS);

    timers.current.giveUp = window.setTimeout(() => {
      // Only give up if we are still listening — the poll may have resolved.
      setPhase((p) => {
        if (p !== "listening") return p;
        stop();
        return "not-found";
      });
    }, LISTEN_MS);
  }, [check, stop]);

  useEffect(() => {
    if (autoStart) start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  const secondsLeft = Math.max(0, Math.round(LISTEN_MS / 1000) - elapsed);
  const progress = Math.min(100, (elapsed / (LISTEN_MS / 1000)) * 100);

  return { phase, start, secondsLeft, progress };
}
