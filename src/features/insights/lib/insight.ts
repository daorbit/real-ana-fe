import {
  DoorOpen,
  FileText,
  Globe2,
  Link2,
  Megaphone,
  Smartphone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { analyticsFilterHref } from "@/features/analytics/lib/analyticsLinks";
import type { StatsFilter } from "@/shared/types";
import type { Insight, InsightKind, InsightTone } from "../types";

export const KIND_ICON: Record<InsightKind, LucideIcon> = {
  traffic: Users,
  engagement: DoorOpen,
  source: Link2,
  page: FileText,
  country: Globe2,
  device: Smartphone,
  campaign: Megaphone,
};

export const KIND_LABEL: Record<InsightKind, string> = {
  traffic: "Visitors",
  engagement: "Engagement",
  source: "Traffic sources",
  page: "Pages",
  country: "Countries",
  device: "Devices",
  campaign: "Campaigns",
};

export const TONE_LABEL: Record<InsightTone, string> = {
  good: "Going well",
  bad: "Worth a look",
  info: "Noticed",
};

const FILTER_KEYS = new Set(["referrer", "path", "country", "device", "utmSource"]);

const isPercent = (insight: Insight) => insight.unit === "points" || insight.unit === "% share";

export function insightHref(insight: Insight): string {
  if (insight.dimension && insight.key && FILTER_KEYS.has(insight.dimension))
    return analyticsFilterHref(insight.dimension as keyof StatsFilter, insight.key);
  return "/app/analytics";
}

export function changeLabel(insight: Insight): string {
  if (insight.delta === null) return "New";
  const sign = insight.delta > 0 ? "+" : "−";
  return isPercent(insight) ? `${sign}${Math.abs(insight.delta)} pts` : `${sign}${Math.abs(insight.delta)}%`;
}

export function barsOf(insight: Insight) {
  const max = Math.max(insight.current, insight.previous, 1);
  const show = (n: number) => (isPercent(insight) ? `${n}%` : n.toLocaleString());
  return {
    current: { value: show(insight.current), pct: (insight.current / max) * 100 },
    previous: { value: show(insight.previous), pct: (insight.previous / max) * 100 },
  };
}

export function weekLabel(start: string, end?: string): string {
  const from = new Date(start);
  const to = end ? new Date(end) : new Date(from.getTime() + 6 * 86_400_000);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${from.toLocaleDateString(undefined, opts)} – ${to.toLocaleDateString(undefined, opts)}`;
}
