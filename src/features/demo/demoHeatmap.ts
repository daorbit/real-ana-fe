import type { HeatmapCell, HeatmapDevice, HeatmapPagesResponse, PageHeatmap } from "@/shared/types";

const GRID = { x: 40, y: 120 };
const SPREAD = 2;

const PAGES: HeatmapPagesResponse["pages"] = [
  { path: "/", clicks: 1284, sessions: 912 },
  { path: "/pricing", clicks: 742, sessions: 488 },
  { path: "/features", clicks: 391, sessions: 305 },
  { path: "/blog/launch-week", clicks: 214, sessions: 266 },
  { path: "/contact", clicks: 128, sessions: 97 },
];

const HOTSPOTS: [number, number, number][] = [
  [34, 3, 60],
  [5, 3, 40],
  [20, 18, 120],
  [26, 18, 50],
  [9, 46, 36],
  [20, 46, 44],
  [31, 46, 30],
  [20, 88, 22],
  [12, 112, 10],
];

const SCROLL_REACH = [100, 92, 81, 70, 58, 47, 38, 29, 21, 14];

function pathShift(path: string): number {
  let hash = 0;
  for (const ch of path) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return (hash % 7) - 3;
}

function squeezeX(x: number, device: HeatmapDevice): number {
  if (device === "desktop") return x;
  const factor = device === "mobile" ? 0.45 : 0.7;
  return Math.round(GRID.x / 2 + (x - GRID.x / 2) * factor);
}

function cellsFor(path: string, device: HeatmapDevice): HeatmapCell[] {
  const shift = pathShift(path);
  const byKey = new Map<string, HeatmapCell>();
  for (const [hx, hy, weight] of HOTSPOTS) {
    const cx = squeezeX(hx, device);
    const cy = Math.min(GRID.y - 1, Math.max(0, hy + shift));
    for (let dx = -SPREAD; dx <= SPREAD; dx++) {
      for (let dy = -SPREAD; dy <= SPREAD; dy++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= GRID.x || y >= GRID.y) continue;
        const n = Math.round(weight * Math.exp(-(dx * dx + dy * dy) / 2));
        if (n <= 0) continue;
        const key = `${x}:${y}`;
        const cell = byKey.get(key);
        if (cell) cell.n += n;
        else byKey.set(key, { x, y, n });
      }
    }
  }
  return [...byKey.values()];
}

export function demoHeatmapPages(): HeatmapPagesResponse {
  return { enabled: true, pages: PAGES };
}

export function demoPageHeatmap(path: string, device: string | null): PageHeatmap {
  const resolved: HeatmapDevice = device === "mobile" || device === "tablet" ? device : "desktop";
  const cells = cellsFor(path, resolved);
  const sessions = PAGES.find((p) => p.path === path)?.sessions ?? 120;
  return {
    path,
    device: resolved,
    grid: GRID,
    clicks: cells.reduce((sum, c) => sum + c.n, 0),
    cells,
    scroll: { sessions, reach: SCROLL_REACH },
  };
}
