import { num } from "@/shared/lib";
import type { SearchMetrics } from "@/shared/types";

export type MetricKey = keyof SearchMetrics;

export type MetricDef = {
  key: MetricKey;
  label: string;
  format: (value: number) => string;
  lowerIsBetter: boolean;
};

export const METRICS: MetricDef[] = [
  { key: "clicks", label: "Clicks", format: (v) => num(Math.round(v)), lowerIsBetter: false },
  { key: "impressions", label: "Impressions", format: (v) => num(Math.round(v)), lowerIsBetter: false },
  { key: "ctr", label: "CTR", format: (v) => `${(v * 100).toFixed(1)}%`, lowerIsBetter: false },
  { key: "position", label: "Avg. position", format: (v) => (v ? v.toFixed(1) : "—"), lowerIsBetter: true },
];

export const RANGES = [
  { value: "7", label: "7d" },
  { value: "28", label: "28d" },
  { value: "90", label: "3m" },
  { value: "180", label: "6m" },
  { value: "480", label: "16m" },
];

export type MetricChange = { text: string; good: boolean; flat: boolean };

export function metricChange(def: MetricDef, current: number, previous?: number): MetricChange | null {
  if (previous === undefined || previous === null) return null;

  if (def.key === "position") {
    if (!current || !previous) return null;
    const diff = previous - current;
    if (Math.abs(diff) < 0.05) return { text: "±0", good: true, flat: true };
    return { text: `${diff > 0 ? "+" : "−"}${Math.abs(diff).toFixed(1)}`, good: diff > 0, flat: false };
  }

  if (!previous) return current ? { text: "new", good: true, flat: false } : null;
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.5) return { text: "±0%", good: true, flat: true };
  const up = pct > 0;
  return {
    text: `${up ? "+" : "−"}${Math.abs(pct).toFixed(Math.abs(pct) < 10 ? 1 : 0)}%`,
    good: def.lowerIsBetter ? !up : up,
    flat: false,
  };
}

export function pagePath(url: string): string {
  try {
    const u = new URL(url);
    return `${u.pathname}${u.search}` || "/";
  } catch {
    return url;
  }
}

export function propertyLabel(propertyUrl: string): string {
  return propertyUrl.replace(/^sc-domain:/, "").replace(/^https?:\/\//, "").replace(/\/$/, "");
}
