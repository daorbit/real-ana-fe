import { useEffect, useRef } from "react";
import { useElementSize } from "@mantine/hooks";
import { drawHeat } from "@/features/analytics/lib/heatmapDraw";
import type { HeatmapCell } from "@/shared/types";

export function useHeatCanvas(cells: HeatmapCell[], grid: { x: number; y: number }) {
  const { ref: frameRef, width, height } = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawHeat(ctx, cells, grid, width, height, getComputedStyle(canvas).color);
  }, [cells, grid, width, height]);

  return { frameRef, canvasRef };
}
