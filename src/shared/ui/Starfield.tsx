import { useEffect, useMemo, useRef } from "react";

 
type Props = {
  count?: number;
 
  variant?: "panel" | "app";
  scrollTarget?: React.RefObject<HTMLElement | null>;
};

type Dot = {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  depth: number;
};

export function Starfield({ count = 34, variant = "panel", scrollTarget }: Props) {
  const layer = useRef<HTMLDivElement>(null);

  const dots = useMemo<Dot[]>(
    () =>
      Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          left: Math.random() * 100,
          top: Math.random() * 100,

          size: 0.8 + depth * depth * 3.2,
          delay: Math.random() * -18,
          duration: 14 + Math.random() * 16,
          opacity: 0.1 + depth * 0.4,
          depth,
        };
      }),
    [count]
  );


  useEffect(() => {
    const el = layer.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = scrollTarget?.current ?? null;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = target ? target.scrollTop : window.scrollY;
      el.style.setProperty("--scroll-y", String(y));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const source: HTMLElement | Window = target ?? window;
    source.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      source.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scrollTarget]);

  return (
    <div ref={layer} className={`starfield starfield-${variant}`} aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          style={
            {
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: d.size,
              height: d.size,
              opacity: d.opacity,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`,
              "--depth": d.depth.toFixed(3),
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
