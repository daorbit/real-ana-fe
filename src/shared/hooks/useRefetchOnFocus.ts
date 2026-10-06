import { useEffect, useRef } from "react";

export function useRefetchOnFocus(
  refetch: () => unknown,
  fulfilledTimeStamp: number | undefined,
  minAgeMs: number,
  enabled = true,
) {
  const latest = useRef({ refetch, fulfilledTimeStamp });
  latest.current = { refetch, fulfilledTimeStamp };
  const triggeredAt = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const { refetch: run, fulfilledTimeStamp: at } = latest.current;
      const now = Date.now();
      if (!at || now - at < minAgeMs || now - triggeredAt.current < minAgeMs) return;
      triggeredAt.current = now;
      void run();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [enabled, minAgeMs]);
}
