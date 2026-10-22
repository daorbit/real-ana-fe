import type { HeatmapCell } from "@/shared/types";

const HALO_SCALE = 2.2;
const CORE_SCALE = 0.9;

export function drawHeat(
  ctx: CanvasRenderingContext2D,
  cells: HeatmapCell[],
  grid: { x: number; y: number },
  width: number,
  height: number,
  color: string,
) {
  ctx.clearRect(0, 0, width, height);
  if (!cells.length || !grid.x || !grid.y) return;

  const max = Math.max(1, ...cells.map((c) => c.n));
  const cellW = width / grid.x;
  const cellH = height / grid.y;
  const base = Math.max(cellW, cellH);

  ctx.fillStyle = color;
  for (const pass of [HALO_SCALE, CORE_SCALE]) {
    for (const cell of cells) {
      const weight = cell.n / max;
      ctx.globalAlpha = pass === HALO_SCALE ? 0.06 + 0.22 * weight : 0.1 + 0.6 * weight;
      ctx.beginPath();
      ctx.arc((cell.x + 0.5) * cellW, (cell.y + 0.5) * cellH, base * pass * (0.6 + 0.4 * weight), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function reachLevel(pct: number): "high" | "mid" | "low" {
  if (pct >= 60) return "high";
  if (pct >= 30) return "mid";
  return "low";
}

export function halfwayDepth(reach: number[]): number | null {
  if (!reach.length) return null;
  const band = reach.findIndex((pct) => pct < 50);
  return band === -1 ? 100 : band * (100 / reach.length);
}
