import { analyticsFilterHref } from "@/features/analytics/lib/analyticsLinks";
import { formatDate } from "@/shared/lib/format";
import type { EvidenceMetric, MetricUnit, RadarEntity, RadarPeriod } from "../types";

const DAY_MS = 86_400_000;

export function metricValue(unit: MetricUnit, value: number): string {
  if (unit === "percent") return `${Math.round(value * 10) / 10}%`;
  return Number.isInteger(value) ? value.toLocaleString() : (Math.round(value * 10) / 10).toLocaleString();
}

export function metricChange(metric: Pick<EvidenceMetric, "current" | "previous" | "unit">): { text: string; dir: "up" | "down" | "flat" } | null {
  if (metric.previous === null) return null;
  const diff = metric.current - metric.previous;
  const dir = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  if (metric.unit === "percent") {
    const pts = Math.round(Math.abs(diff) * 10) / 10;
    return { text: dir === "flat" ? "No change" : `${diff > 0 ? "+" : "−"}${pts} pts`, dir };
  }
  if (metric.previous === 0) return { text: dir === "flat" ? "No change" : "New", dir };
  const pct = Math.round((Math.abs(diff) / metric.previous) * 100);
  return { text: dir === "flat" ? "No change" : `${diff > 0 ? "+" : "−"}${pct}%`, dir };
}

function day(value: string): string {
  return formatDate(value, { day: "numeric", month: "short" });
}

function lastDay(end: string, includesToday: boolean): string {
  return includesToday ? "today" : day(new Date(new Date(end).getTime() - DAY_MS).toISOString());
}

export function periodLabel(period: RadarPeriod): string {
  return `${day(period.start)} – ${lastDay(period.end, period.includesToday)}`;
}

export function previousPeriodLabel(period: RadarPeriod): string | null {
  if (!period.previousStart || !period.previousEnd) return null;
  return `${day(period.previousStart)} – ${lastDay(period.previousEnd, false)}`;
}

export function entityHref(entity: RadarEntity): string {
  switch (entity.type) {
    case "page":
      return analyticsFilterHref("path", entity.key);
    case "form":
      return `/app/lead-insights?form=${encodeURIComponent(entity.key)}`;
    case "bookingForm":
      return "/app/bookings";
    case "searchProperty":
      return "/app/search-visibility";
    default:
      return "/app/analytics";
  }
}

export function primaryOf<T extends { metrics: EvidenceMetric[]; primaryMetric: string }>(item: T): EvidenceMetric | undefined {
  return item.metrics.find((m) => m.key === item.primaryMetric) ?? item.metrics[0];
}
