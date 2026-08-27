import { useCallback, useEffect, useState } from "react";

interface Options {
  /** The content's natural width and height, before scaling. */
  contentWidth: number;
  contentHeight: number;
  /** Room left around the content inside the container. */
  padding?: { x: number; y: number };
}

interface FitScale {
  /** Attach to the element the content has to fit inside. */
  ref: (node: HTMLElement | null) => void;
  /** 1 until the container has been measured — pair with `measured` before showing anything. */
  scale: number;
  measured: boolean;
}

/**
 * The largest scale at which `contentWidth x contentHeight` fits inside the
 * measured element, capped at 1:1 — content is shrunk to fit but never blown
 * up, which would misrepresent what it looks like at its real size.
 *
 * Returns a *callback ref* rather than taking a `RefObject`: these previews
 * can live in panes that are not mounted on first render, and an object ref's
 * effect would run before the element exists and never re-run. A callback ref
 * fires when the element actually arrives.
 */
export function useFitScale({ contentWidth, contentHeight, padding }: Options): FitScale {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);
  const [measured, setMeasured] = useState(false);

  const padX = padding?.x ?? 0;
  const padY = padding?.y ?? 0;

  const ref = useCallback((node: HTMLElement | null) => setElement(node), []);

  useEffect(() => {
    if (!element) return;

    let frame = 0;

    const fit = () => {
      const width = element.clientWidth - padX;
      const height = element.clientHeight - padY;
      if (width <= 0 || height <= 0) return false;

      const next = Math.min(1, width / contentWidth, height / contentHeight);
      if (!Number.isFinite(next) || next <= 0) return false;

      setScale(next);
      setMeasured(true);
      return true;
    };

    const retry = () => {
      if (fit()) return;
      frame = requestAnimationFrame(retry);
    };
    retry();

    const observer = new ResizeObserver(() => fit());
    observer.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [element, contentWidth, contentHeight, padX, padY]);

  useEffect(() => {
    if (!element) setMeasured(false);
  }, [element]);

  return { ref, scale, measured };
}
