import { useEffect, useState, type RefObject } from "react";

const COMPACT_AFTER_PX = 80;
const EXPAND_BEFORE_PX = 48;
const DIRECTION_THRESHOLD_PX = 12;

export function useCompactOnScroll(scroller: RefObject<HTMLElement | null>, resetKey: string): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let pivot = el.scrollTop;
    let down = true;
    let frame = 0;

    const read = () => {
      frame = 0;
      const top = el.scrollTop;
      const delta = top - pivot;

      if (top <= EXPAND_BEFORE_PX) {
        pivot = top;
        down = false;
        setCompact(false);
        return;
      }

      if (down ? delta < 0 : delta > 0) {
        pivot = top;
        return;
      }
      if (Math.abs(delta) < DIRECTION_THRESHOLD_PX) return;

      down = delta > 0;
      pivot = top;
      setCompact(down && top > COMPACT_AFTER_PX);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [scroller]);

  useEffect(() => {
    setCompact(false);
  }, [resetKey]);

  return compact;
}
