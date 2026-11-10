import { useCallback, useRef } from "react";

function rowsFor(el: HTMLElement) {
  const grid = el.parentElement;
  if (!grid) return;
  const css = getComputedStyle(grid);
  const unit = parseFloat(css.gridAutoRows) || 4;
  const gap = parseFloat(css.columnGap) || 0;
  const height = el.getBoundingClientRect().height;
  el.style.setProperty("--masonry-rows", String(Math.max(1, Math.ceil((height + gap) / unit))));
}

export function useMasonryRows() {
  const observer = useRef<ResizeObserver | null>(null);

  return useCallback((el: HTMLElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => rowsFor(el));
    ro.observe(el);
    observer.current = ro;
    rowsFor(el);
  }, []);
}
