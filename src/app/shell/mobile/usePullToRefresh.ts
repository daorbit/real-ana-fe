import { useEffect, useRef, type RefObject } from "react";
import { haptic } from "@/shared/lib/haptics";

const THRESHOLD = 64;
const MAX = 96;
const RESISTANCE = 0.45;

export function usePullToRefresh(
  scroller: RefObject<HTMLElement | null>,
  indicator: RefObject<HTMLElement | null>,
  enabled: boolean,
  onRefresh: () => Promise<unknown>,
) {
  const latest = useRef(onRefresh);
  latest.current = onRefresh;

  useEffect(() => {
    const el = scroller.current;
    const mark = indicator.current;
    if (!enabled || !el || !mark) return;

    let startX = 0;
    let startY = 0;
    let distance = 0;
    let tracking = false;
    let busy = false;
    let armed = false;

    const paint = (value: number) => {
      distance = value;
      mark.style.setProperty("--ptr", String(value));
      const ready = value >= THRESHOLD;
      if (ready && !armed) haptic(6);
      armed = ready;
      mark.dataset.ready = ready ? "true" : "false";
    };

    const onStart = (e: TouchEvent) => {
      if (busy || e.touches.length !== 1 || el.scrollTop > 0) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
      armed = false;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (el.scrollTop > 0 || (distance === 0 && (dy <= 0 || Math.abs(dx) > dy))) {
        tracking = false;
        if (distance) paint(0);
        mark.dataset.state = "";
        return;
      }
      mark.dataset.state = "pulling";
      paint(Math.min(Math.max(dy, 0) * RESISTANCE, MAX));
    };

    const onEnd = async () => {
      if (!tracking) return;
      tracking = false;
      if (distance < THRESHOLD) {
        mark.dataset.state = "";
        paint(0);
        return;
      }
      busy = true;
      mark.dataset.state = "refreshing";
      paint(THRESHOLD);
      try {
        await latest.current();
      } finally {
        busy = false;
        mark.dataset.state = "";
        paint(0);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [scroller, indicator, enabled]);
}
