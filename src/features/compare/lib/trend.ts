import { formatDate } from "@/shared/lib";
import type { SeoCompetitorHistoryPoint } from "@/shared/types";

export type TrendRow = { date: string; [seriesId: string]: string | number | null };

export const MAX_SERIES = 6;

const SERIES_LIGHT = ["#2a78d6", "#e0662d", "#7c5cd6", "#c98500", "#d4487c", "#0f8fb0"];
const SERIES_DARK = ["#4a90e8", "#e5773f", "#9b7cf0", "#d9a019", "#e0608f", "#2bb3d4"];

export function seriesPalette(dark: boolean): string[] {
  return dark ? SERIES_DARK : SERIES_LIGHT;
}

export function youColor(dark: boolean): string {
  return dark ? "#10b981" : "#047857";
}

export function chartInk(dark: boolean): { axis: string; grid: string } {
  return dark ? { axis: "#8b929e", grid: "#26292f" } : { axis: "#6b707c", grid: "#ececf0" };
}

export function trendRows(history: SeoCompetitorHistoryPoint[]): TrendRow[] {
  const byDate = new Map<string, TrendRow>();
  for (const point of history) {
    if (point.statusCode >= 400) continue;
    const date = point.takenAt.slice(0, 10);
    const row = byDate.get(date) ?? { date };
    row[point.competitorId] = point.score;
    byDate.set(date, row);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function trendDomain(rows: TrendRow[], myScore: number): [number, number] {
  let low = myScore;
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (key !== "date" && typeof value === "number" && value < low) low = value;
    }
  }
  return [Math.max(0, Math.floor((low - 5) / 10) * 10), 100];
}

export function chartDate(date: string): string {
  return formatDate(`${date}T12:00:00Z`, { day: "numeric", month: "short" });
}
