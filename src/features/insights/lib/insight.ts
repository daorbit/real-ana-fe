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

export const SECTIONS: { tone: InsightTone; title: string }[] = [
  { tone: "good", title: "What went well" },
  { tone: "bad", title: "Worth a look" },
  { tone: "info", title: "Also noticed" },
];

const FILTER_KEYS = new Set(["referrer", "path", "country", "device", "utmSource"]);

export function insightHref(insight: Insight): string {
  if (insight.dimension && insight.key && FILTER_KEYS.has(insight.dimension))
    return analyticsFilterHref(insight.dimension as keyof StatsFilter, insight.key);
  return "/app/analytics";
}

export function deltaLabel(insight: Insight): string | null {
  if (insight.delta === null) return "New";
  if (insight.unit === "points" || insight.unit === "% share")
    return `${insight.delta > 0 ? "+" : ""}${insight.delta} pts`;
  return `${insight.delta > 0 ? "+" : ""}${insight.delta}%`;
}

export function comparisonLabel(insight: Insight): string {
  const fmt = (n: number) => n.toLocaleString();
  if (insight.unit === "points" || insight.unit === "% share") return `${insight.current}% vs ${insight.previous}%`;
  return `${fmt(insight.current)} vs ${fmt(insight.previous)} ${insight.unit}`;
}

export function weekLabel(start: string, end?: string): string {
  const from = new Date(start);
  const to = end ? new Date(end) : new Date(from.getTime() + 6 * 86_400_000);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${from.toLocaleDateString(undefined, opts)} – ${to.toLocaleDateString(undefined, opts)}`;
}
