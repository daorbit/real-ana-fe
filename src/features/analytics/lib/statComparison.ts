import dayjs from "dayjs";
import { duration, num } from "@/shared/lib";
import type { Comparison, Stats } from "@/shared/types";
import type { StatComparison } from "@/shared/ui/StatCard";

export type ComparedMetric = "visitors" | "pageviews" | "sessions" | "bounceRate" | "avgSessionMs" | "pagesPerSession";

const FORMAT: Record<ComparedMetric, (v: number) => string> = {
  visitors: num,
  pageviews: num,
  sessions: num,
  bounceRate: (v) => `${v}%`,
  avgSessionMs: duration,
  pagesPerSession: (v) => String(v),
};

export function comparisonLabel(comparison: Comparison, range: string): string {
  if (comparison.mode === "yoy") return "same period last year";
  if (comparison.mode === "custom") return `${range} from ${dayjs(comparison.since).format("MMM D, YYYY")}`;
  return `previous ${range}`;
}

export function statComparison(
  view: Stats | null | undefined,
  metric: ComparedMetric,
  range: string,
): StatComparison | undefined {
  const base = view?.comparison;
  if (!view || !base) return undefined;
  const format = FORMAT[metric];
  return {
    previous: format(base[metric] ?? 0),
    current: format(view[metric] ?? 0),
    label: comparisonLabel(base, range),
  };
}
