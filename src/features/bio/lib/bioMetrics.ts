import { num } from "@/shared/lib";
import { percentChange, type MetricTileChange } from "@/shared/lib/metricChange";
import type { BioDailyPoint, BioPageStatsDetail } from "@/features/bio/types";

export type BioMetricKey = "views" | "visitors" | "clicks" | "rate";

export type BioMetricDef = {
  key: BioMetricKey;
  label: string;
  color: string;
  hint: string;
  format: (value: number) => string;
};

const rateText = (value: number) => `${(value * 100).toFixed(value < 0.1 ? 1 : 0)}%`;

export const BIO_METRICS: BioMetricDef[] = [
  { key: "views", label: "Views", color: "var(--metric-blue)", hint: "How many times the page was opened.", format: num },
  { key: "visitors", label: "Visitors", color: "var(--metric-purple)", hint: "Different people who opened the page, counted once a day without cookies.", format: num },
  { key: "clicks", label: "Clicks", color: "var(--metric-teal)", hint: "Taps on any button or service on the page.", format: num },
  { key: "rate", label: "Click rate", color: "var(--metric-orange)", hint: "Clicks divided by views.", format: rateText },
];

export type BioChartPoint = BioDailyPoint & { rate: number };

export function chartPoints(daily: BioDailyPoint[]): BioChartPoint[] {
  return daily.map((p) => ({ ...p, rate: p.views ? p.clicks / p.views : 0 }));
}

export function metricTotals(stats: BioPageStatsDetail): Record<BioMetricKey, number> {
  return { views: stats.views, visitors: stats.visitors, clicks: stats.clicks, rate: stats.views ? stats.clicks / stats.views : 0 };
}

export function metricChange(key: BioMetricKey, stats: BioPageStatsDetail): MetricTileChange | null {
  const prev = stats.previous;
  if (!prev) return null;
  const before: Record<BioMetricKey, number> = {
    views: prev.views,
    visitors: prev.visitors,
    clicks: prev.clicks,
    rate: prev.views ? prev.clicks / prev.views : 0,
  };
  const now = metricTotals(stats)[key];
  if (!before[key]) return now ? { text: "new", good: true, flat: false } : null;
  return percentChange(((now - before[key]) / before[key]) * 100);
}

export function toggleBioMetric(selected: BioMetricKey[], key: BioMetricKey): BioMetricKey[] {
  if (!selected.includes(key)) return [...selected, key];
  return selected.length > 1 ? selected.filter((k) => k !== key) : selected;
}
