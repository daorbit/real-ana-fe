import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";

type Point = { x: number; y: number };

const STORAGE_KEY = "notes.panel.position";
const EDGE = 8;
const INTERACTIVE = "button, input, textarea, select, a, [role='menuitem']";

function readStored(): Point | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Point;
    return Number.isFinite(p.x) && Number.isFinite(p.y) ? p : null;
  } catch {
    return null;
  }
}

function writeStored(p: Point | null) {
  try {
    if (p) localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}

function clamp(p: Point, el: HTMLElement): Point {
  const maxX = Math.max(EDGE, window.innerWidth - el.offsetWidth - EDGE);
  const maxY = Math.max(EDGE, window.innerHeight - el.offsetHeight - EDGE);
  return {
    x: Math.min(Math.max(EDGE, p.x), maxX),
    y: Math.min(Math.max(EDGE, p.y), maxY),
  };
}

export function useDraggablePanel<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  const position = useRef<Point | null>(readStored());
  const [dragging, setDragging] = useState(false);

  const paint = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (!enabled || !position.current) {
      el.removeAttribute("data-placed");
      return;
    }
    const p = clamp(position.current, el);
    position.current = p;
    el.style.setProperty("--notes-x", `${p.x}px`);
    el.style.setProperty("--notes-y", `${p.y}px`);
    el.setAttribute("data-placed", "");
  }, [enabled]);

  useLayoutEffect(paint);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(paint);
    observer.observe(el);
    window.addEventListener("resize", paint);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", paint);
    };
  }, [paint]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const el = ref.current;
      const target = e.target as HTMLElement;
      if (!enabled || !el || e.button !== 0) return;
      if (!target.closest("[data-drag-handle]") || target.closest(INTERACTIVE)) return;

      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - rect.left;
      const dy = e.clientY - rect.top;
      setDragging(true);

      const move = (ev: PointerEvent) => {
        position.current = { x: ev.clientX - dx, y: ev.clientY - dy };
        paint();
      };
      const up = () => {
        setDragging(false);
        writeStored(position.current);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    },
    [enabled, paint]
  );

  const onDoubleClick = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-drag-handle]") || target.closest(INTERACTIVE)) return;
      position.current = null;
      writeStored(null);
      paint();
    },
    [paint]
  );

  return { ref, dragging, onPointerDown, onDoubleClick };
}
