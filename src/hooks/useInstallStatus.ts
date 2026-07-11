import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";

export type InstallPhase = "idle" | "listening" | "installed" | "not-found";

type StatusResponse = {
  installed: boolean;
  eventCount: number;
  lastEventAt: string | null;
};

const LISTEN_MS = 30_000; // how long we wait for the customer to load their site
const POLL_MS = 2_000;

/** A one-shot read of whether a site has ever reported an event. */
export function useSiteInstalled(workspaceId: string, siteId: string) {
  const [installed, setInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .get<StatusResponse>(`/api/workspaces/${workspaceId}/sites/${siteId}/status`)
      .then((s) => alive && setInstalled(s.installed))
      .catch(() => alive && setInstalled(null));
    return () => {
      alive = false;
    };
  }, [workspaceId, siteId]);

  return installed;
}

/**
 * Drives the "is my snippet working?" checker: polls the install-status
 * endpoint for 30 seconds and resolves as soon as the first event lands.
 */
export function useInstallCheck(workspaceId: string, siteId: string, autoStart = false) {
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
      const s = await api.get<StatusResponse>(
        `/api/workspaces/${workspaceId}/sites/${siteId}/status`
      );
      return s.installed;
    } catch {
      return false;
    }
  }, [workspaceId, siteId]);

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
