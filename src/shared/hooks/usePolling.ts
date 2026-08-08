import { useCallback, useEffect, useRef, useState } from "react";

export const POLL_MS = 60_000; // 1 minute

/**
 * Runs `load` on mount and whenever `deps` change, then every POLL_MS.
 *
 * `refresh()` triggers an immediate load, exposes a `refreshing` flag for the
 * spinner, and restarts the interval so the next automatic poll is a full
 * minute after the manual one (rather than firing straight away).
 */
export function usePolling(load: () => Promise<void> | void, deps: unknown[]) {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const timer = useRef<number | undefined>(undefined);
  // Keep the latest callback without making it a dependency of the interval.
  const loadRef = useRef(load);
  loadRef.current = load;

  const run = useCallback(async (manual: boolean) => {
    if (manual) setRefreshing(true);
    try {
      await loadRef.current();
      setLastUpdated(new Date());
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  const schedule = useCallback(() => {
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => run(false), POLL_MS);
  }, [run]);

  const refresh = useCallback(async () => {
    await run(true);
    schedule();
  }, [run, schedule]);

  useEffect(() => {
    run(false);
    schedule();
    return () => window.clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { refresh, refreshing, lastUpdated };
}
