import type { Point } from "@/shared/types";

export type TrendMetric = "views" | "visitors";

export type TrendPoint = Point & {
  compareViews?: number;
  compareVisitors?: number;
  compareBucket?: string;
};

type TrendSeries = {
  compareKey: "compareViews" | "compareVisitors";
  label: string;
  color: string;
};

export const TREND_SERIES: Record<TrendMetric, TrendSeries> = {
  views: { compareKey: "compareViews", label: "Pageviews", color: "var(--metric-orange)" },
  visitors: { compareKey: "compareVisitors", label: "Visitors", color: "var(--metric-blue)" },
};

export function changeFrom(previous: number, current: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export function withBaseline(current: Point[] = [], baseline?: Point[] | null): TrendPoint[] {
  if (!baseline?.length) return current;
  return current.map((p, i) => ({
    ...p,
    compareViews: baseline[i]?.views ?? 0,
    compareVisitors: baseline[i]?.visitors ?? 0,
    compareBucket: baseline[i]?.bucket ?? "",
  }));
}
