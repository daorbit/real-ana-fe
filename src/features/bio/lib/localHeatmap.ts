import type { HeatCell } from "@/shared/types";

export function toLocalHeatmap(cells: HeatCell[]): HeatCell[] {
  const shift = Math.round(-new Date().getTimezoneOffset() / 60);
  if (!shift) return cells;
  const merged = new Map<string, HeatCell>();
  for (const cell of cells) {
    const total = cell.day * 24 + cell.hour + shift;
    const wrapped = ((total % 168) + 168) % 168;
    const day = Math.floor(wrapped / 24);
    const hour = wrapped % 24;
    const key = `${day}-${hour}`;
    const existing = merged.get(key);
    merged.set(key, { day, hour, count: (existing?.count ?? 0) + cell.count });
  }
  return [...merged.values()];
}
