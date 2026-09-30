import { Users, Eye, Layers, Target, ClipboardList, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { compact, num } from "@/shared/lib";
import type { TargetMetric, TargetProgress, TargetStatus } from "@/features/goals/types";

export type MetricMeta = {
  value: TargetMetric;
  label: string;
  unit: string;
  description: string;
  icon: LucideIcon;
  lowerIsBetter: boolean;
  needsSite: boolean;
  placeholder: number;
};

export const METRICS: MetricMeta[] = [
  { value: "visitors", label: "Visitors", unit: "visitors", description: "Unique people across your sites", icon: Users, lowerIsBetter: false, needsSite: true, placeholder: 10_000 },
  { value: "pageviews", label: "Pageviews", unit: "pageviews", description: "Every page loaded", icon: Eye, lowerIsBetter: false, needsSite: true, placeholder: 50_000 },
  { value: "sessions", label: "Sessions", unit: "sessions", description: "Distinct visits", icon: Layers, lowerIsBetter: false, needsSite: true, placeholder: 15_000 },
  { value: "conversions", label: "Conversions", unit: "conversions", description: "People who hit a conversion goal", icon: Target, lowerIsBetter: false, needsSite: true, placeholder: 250 },
  { value: "formSubmissions", label: "Form submissions", unit: "submissions", description: "Responses to your lead-capture forms", icon: ClipboardList, lowerIsBetter: false, needsSite: false, placeholder: 500 },
  { value: "searchPosition", label: "Average position", unit: "avg. position", description: "Where you rank on Google, lower is better", icon: Search, lowerIsBetter: true, needsSite: true, placeholder: 5 },
];

export const METRIC_MAP = Object.fromEntries(METRICS.map((m) => [m.value, m])) as Record<TargetMetric, MetricMeta>;

export function formatMetric(metric: TargetMetric, value: number, short = false): string {
  if (metric === "searchPosition") return value.toFixed(1);
  return short ? compact(Math.round(value)) : num(Math.round(value));
}

export function targetStatus(t: TargetProgress): TargetStatus {
  if (t.status === "unavailable") return "unavailable";
  if (t.achieved) return "achieved";
  if (t.direction === "below") return "climbing";
  if (t.projected !== null && t.projected >= t.target) return "onTrack";
  return t.elapsed < 0.05 ? "onTrack" : "behind";
}

export const STATUS_META: Record<TargetStatus, { label: string; color: string }> = {
  achieved: { label: "Achieved", color: "emerald" },
  onTrack: { label: "On track", color: "teal" },
  behind: { label: "Behind pace", color: "orange" },
  climbing: { label: "In progress", color: "cyan" },
  unavailable: { label: "Needs setup", color: "gray" },
};

export function paceText(t: TargetProgress): { text: string; tone: "up" | "down" | "flat" } {
  if (t.status === "unavailable") return { text: t.reason ?? "Needs setup", tone: "flat" };
  const current = t.current ?? 0;

  if (t.direction === "below") {
    if (t.achieved) return { text: `${(t.target - current).toFixed(1)} places inside your target`, tone: "up" };
    return { text: `${(current - t.target).toFixed(1)} places to climb`, tone: "down" };
  }

  if (t.achieved) {
    return {
      text: t.daysLeft > 0 ? `Hit with ${t.daysLeft} day${t.daysLeft === 1 ? "" : "s"} to spare` : "Target reached",
      tone: "up",
    };
  }

  const expected = t.target * t.elapsed;
  const diff = current - expected;
  const projected = t.projected !== null ? ` · on pace for ${formatMetric(t.metric, t.projected, true)}` : "";
  if (t.elapsed < 0.05) return { text: `Just getting started${projected}`, tone: "flat" };
  if (diff >= 0) return { text: `${formatMetric(t.metric, diff, true)} ahead of pace${projected}`, tone: "up" };
  return { text: `${formatMetric(t.metric, -diff, true)} behind pace${projected}`, tone: "down" };
}

export function percentLabel(t: TargetProgress): string {
  return `${Math.round(t.progress * 100)}%`;
}

export function suggestName(metric: TargetMetric, target: number, period: "month" | "quarter"): string {
  const meta = METRIC_MAP[metric];
  const when = period === "month" ? "this month" : "this quarter";
  if (metric === "searchPosition") return `Average position under ${target || meta.placeholder}`;
  return `${formatMetric(metric, target || meta.placeholder, true)} ${meta.unit} ${when}`;
}
