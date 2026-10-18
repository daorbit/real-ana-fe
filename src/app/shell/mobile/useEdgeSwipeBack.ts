import { useEffect, useRef, type RefObject } from "react";
import { haptic } from "@/shared/lib/haptics";

const EDGE = 24;
const COMMIT = 90;

export function useEdgeSwipeBack(
  surface: RefObject<HTMLElement | null>,
  enabled: boolean,
  onBack: () => void,
) {
  const latest = useRef(onBack);
  latest.current = onBack;

  useEffect(() => {
    const el = surface.current;
    if (!enabled || !el) return;

    let startX = 0;
    let startY = 0;
    let dx = 0;
    let tracking = false;
    let locked = false;

    const settle = (to: number) => {
      el.dataset.swipe = "settling";
      el.style.setProperty("--swipe-x", `${to}px`);
    };

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || e.touches[0].clientX > EDGE) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dx = 0;
      tracking = true;
      locked = false;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const x = e.touches[0].clientX - startX;
      const y = e.touches[0].clientY - startY;
      if (!locked) {
        if (Math.abs(y) > Math.abs(x)) {
          tracking = false;
          return;
        }
        if (x < 8) return;
        locked = true;
      }
      dx = Math.max(0, x);
      el.dataset.swipe = "dragging";
      el.style.setProperty("--swipe-x", `${dx}px`);
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (!locked) return;
      if (dx >= COMMIT) {
        haptic(8);
        settle(window.innerWidth);
        window.setTimeout(() => {
          latest.current();
          el.dataset.swipe = "";
          el.style.setProperty("--swipe-x", "0px");
        }, 180);
        return;
      }
      settle(0);
      window.setTimeout(() => {
        el.dataset.swipe = "";
      }, 220);
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
      el.dataset.swipe = "";
      el.style.removeProperty("--swipe-x");
    };
  }, [surface, enabled]);
}
