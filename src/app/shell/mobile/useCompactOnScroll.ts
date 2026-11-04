import { useEffect, useState, type RefObject } from "react";

const COMPACT_AFTER_PX = 80;
const DIRECTION_THRESHOLD_PX = 6;

export function useCompactOnScroll(scroller: RefObject<HTMLElement | null>, resetKey: string): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let last = el.scrollTop;
    let frame = 0;

    const read = () => {
      frame = 0;
      const top = el.scrollTop;
      const delta = top - last;
      if (Math.abs(delta) < DIRECTION_THRESHOLD_PX) return;
      last = top;
      setCompact(delta > 0 && top > COMPACT_AFTER_PX);
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
