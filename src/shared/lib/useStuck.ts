import { useEffect, useRef, useState } from "react";

export function useStuck<T extends HTMLElement = HTMLDivElement>() {
  const sentinel = useRef<T>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const root = el.closest<HTMLElement>(".app-panel__scroll");
    const io = new IntersectionObserver(
      ([entry]) => {
        const top = entry.rootBounds?.top ?? 0;
        setStuck(!entry.isIntersecting && entry.boundingClientRect.top < top);
      },
      { root, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { sentinel, stuck };
}
