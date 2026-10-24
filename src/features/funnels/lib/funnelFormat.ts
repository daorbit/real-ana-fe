import type { FunnelTrendUnit } from "@/shared/types";

export type Tone = "up" | "down" | "flat";

export function stepCountLabel(count: number): string {
  return `${count} step${count === 1 ? "" : "s"}`;
}

export function percentLabel(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

export function durationLabel(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return rest ? `${hours}h ${rest}m` : `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function relativeChange(current: number, previous: number | null | undefined): { label: string; tone: Tone } | null {
  if (previous === null || previous === undefined) return null;
  if (previous === 0) return current === 0 ? { label: "No change", tone: "flat" } : { label: "New", tone: "up" };
  const change = Math.round(((current - previous) / previous) * 1000) / 10;
  if (change === 0) return { label: "No change", tone: "flat" };
  return { label: `${change > 0 ? "▲" : "▼"} ${Math.abs(change)}%`, tone: change > 0 ? "up" : "down" };
}

export function pointChange(current: number, previous: number | null | undefined): { label: string; tone: Tone } | null {
  if (previous === null || previous === undefined) return null;
  const change = Math.round((current - previous) * 10) / 10;
  if (change === 0) return { label: "No change", tone: "flat" };
  return { label: `${change > 0 ? "▲" : "▼"} ${Math.abs(change)} pts`, tone: change > 0 ? "up" : "down" };
}

export function trendTickLabel(iso: string, unit: FunnelTrendUnit): string {
  const date = new Date(iso);
  if (unit === "5min" || unit === "hour") {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: unit === "5min" ? "2-digit" : undefined });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const RANGE_LABELS: Record<string, string> = {
  "1h": "Last hour",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  custom: "Custom range",
};

export function rangeLabel(preset: string): string {
  return RANGE_LABELS[preset] ?? "Selected range";
}

export function trendUnitLabel(unit: FunnelTrendUnit): string {
  if (unit === "5min") return "every 5 minutes";
  if (unit === "hour") return "by hour";
  if (unit === "week") return "by week";
  return "by day";
}
