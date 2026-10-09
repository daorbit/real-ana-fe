import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { MAP_HEIGHT, MAP_WIDTH, type CountryShape } from "./useWorldPaths";

export type Zoom = { k: number; x: number; y: number };

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const BUTTON_STEP = 1.6;
const WHEEL_STEP = 1.0015;
const IDENTITY: Zoom = { k: 1, x: 0, y: 0 };

const clampScale = (k: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k));

const clampZoom = ({ k, x, y }: Zoom): Zoom => ({
  k,
  x: Math.min(0, Math.max(MAP_WIDTH - MAP_WIDTH * k, x)),
  y: Math.min(0, Math.max(MAP_HEIGHT - MAP_HEIGHT * k, y)),
});

const zoomAt = (z: Zoom, factor: number, px: number, py: number): Zoom => {
  const k = clampScale(z.k * factor);
  const r = k / z.k;
  return clampZoom({ k, x: px - (px - z.x) * r, y: py - (py - z.y) * r });
};

export const isIdentity = (z: Zoom) => z.k === 1 && z.x === 0 && z.y === 0;

export function zoomShape(shape: CountryShape, { k, x, y }: Zoom): CountryShape {
  const [[x0, y0], [x1, y1]] = shape.bounds;
  return {
    ...shape,
    anchor: [shape.anchor[0] * k + x, shape.anchor[1] * k + y],
    bounds: [[x0 * k + x, y0 * k + y], [x1 * k + x, y1 * k + y]],
  };
}

export function useMapZoom() {
  const surface = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState<Zoom>(IDENTITY);
  const [dragging, setDragging] = useState(false);
  const current = useRef(zoom);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    current.current = zoom;
  }, [zoom]);

  const toMap = useCallback((clientX: number, clientY: number) => {
    const rect = surface.current?.getBoundingClientRect();
    if (!rect || !rect.width) return { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, ratio: 1 };
    const ratio = MAP_WIDTH / rect.width;
    return { x: (clientX - rect.left) * ratio, y: (clientY - rect.top) * ratio, ratio };
  }, []);

  useEffect(() => {
    const el = surface.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && current.current.k <= MIN_ZOOM) return;
      e.preventDefault();
      const { x, y } = toMap(e.clientX, e.clientY);
      setZoom((z) => zoomAt(z, Math.pow(WHEEL_STEP, -e.deltaY), x, y));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [toMap]);

  const zoomIn = useCallback(() => setZoom((z) => zoomAt(z, BUTTON_STEP, MAP_WIDTH / 2, MAP_HEIGHT / 2)), []);
  const zoomOut = useCallback(() => setZoom((z) => zoomAt(z, 1 / BUTTON_STEP, MAP_WIDTH / 2, MAP_HEIGHT / 2)), []);
  const reset = useCallback(() => setZoom(IDENTITY), []);

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (zoom.k <= MIN_ZOOM) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!last.current) return;
    const { ratio } = toMap(e.clientX, e.clientY);
    const dx = (e.clientX - last.current.x) * ratio;
    const dy = (e.clientY - last.current.y) * ratio;
    last.current = { x: e.clientX, y: e.clientY };
    setZoom((z) => clampZoom({ ...z, x: z.x + dx, y: z.y + dy }));
  };

  const endDrag = (e: PointerEvent<SVGSVGElement>) => {
    if (!last.current) return;
    last.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  return {
    surface,
    zoom,
    dragging,
    canZoomIn: zoom.k < MAX_ZOOM,
    canZoomOut: zoom.k > MIN_ZOOM,
    zoomIn,
    zoomOut,
    reset,
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag },
  };
}
