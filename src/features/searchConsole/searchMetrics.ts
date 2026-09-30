import { num } from "@/shared/lib";
import type { SearchMetrics, SearchType } from "@/shared/types";

export type MetricKey = keyof SearchMetrics;

export type MetricDef = {
  key: MetricKey;
  label: string;
  short: string;
  tone: "emerald" | "cyan" | "amber" | "pink";
  color: string;
  format: (value: number) => string;
  lowerIsBetter: boolean;
};

export const METRICS: MetricDef[] = [
  {
    key: "clicks",
    label: "Total clicks",
    short: "Clicks",
    tone: "emerald",
    color: "#059669",
    format: (v) => num(Math.round(v)),
    lowerIsBetter: false,
  },
  {
    key: "impressions",
    label: "Total impressions",
    short: "Impressions",
    tone: "cyan",
    color: "#3b82f6",
    format: (v) => num(Math.round(v)),
    lowerIsBetter: false,
  },
  {
    key: "ctr",
    label: "Average CTR",
    short: "CTR",
    tone: "amber",
    color: "#d97706",
    format: (v) => `${(v * 100).toFixed(1)}%`,
    lowerIsBetter: false,
  },
  {
    key: "position",
    label: "Average position",
    short: "Position",
    tone: "pink",
    color: "#ec4899",
    format: (v) => (v ? v.toFixed(1) : "—"),
    lowerIsBetter: true,
  },
];

export const METRIC_BY_KEY = Object.fromEntries(METRICS.map((m) => [m.key, m])) as Record<MetricKey, MetricDef>;

export const RANGES = [
  { value: "7", label: "7 days" },
  { value: "28", label: "28 days" },
  { value: "90", label: "3 months" },
  { value: "180", label: "6 months" },
  { value: "480", label: "16 months" },
];

export const SEARCH_TYPE_OPTIONS = [
  {
    group: "Google Search",
    items: [
      { value: "web", label: "Web" },
      { value: "image", label: "Image" },
      { value: "video", label: "Video" },
      { value: "news", label: "News tab" },
    ],
  },
  {
    group: "Other surfaces",
    items: [
      { value: "discover", label: "Discover" },
      { value: "googleNews", label: "Google News" },
    ],
  },
];

const TYPES_WITHOUT_QUERIES: SearchType[] = ["discover", "googleNews"];

export function typeHasQueries(type: SearchType): boolean {
  return !TYPES_WITHOUT_QUERIES.includes(type);
}

export type MetricChange = { text: string; good: boolean; flat: boolean };

export function metricChange(def: MetricDef, current: number, previous?: number | null): MetricChange | null {
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

export function propertyOrigin(propertyUrl: string): string {
  if (propertyUrl.startsWith("sc-domain:")) return `https://${propertyUrl.slice("sc-domain:".length)}`;
  return propertyUrl.replace(/\/$/, "");
}

export function resolvePageUrl(propertyUrl: string, input: string): string {
  const value = input.trim();
  if (/^https?:\/\//i.test(value)) return value;
  const host = propertyLabel(propertyUrl);
  const withoutHost = value.startsWith(host) ? value.slice(host.length) : value;
  const path = withoutHost.startsWith("/") ? withoutHost : `/${withoutHost}`;
  return `${propertyOrigin(propertyUrl)}${path}`;
}

export function positionTone(position: number): "top" | "first" | "near" | "far" {
  if (position <= 3) return "top";
  if (position <= 10) return "first";
  if (position <= 20) return "near";
  return "far";
}

export function percentDelta(current: number, previous?: number | null): number | null {
  if (previous === undefined || previous === null || !previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
