import { useMemo } from "react";
import type { SeoIssue } from "../../types";
import { AREA_LABEL, sevRank } from "./utils";

/** The worst severity present in a set of issues, or null when there are none. */
export function worstSeverity(issues: SeoIssue[]): SeoIssue["severity"] | null {
  if (issues.some((i) => i.severity === "critical")) return "critical";
  if (issues.some((i) => i.severity === "warning")) return "warning";
  if (issues.some((i) => i.severity === "info")) return "info";
  return null;
}

export type IssueBreakdown = {
  critical: number;
  warning: number;
  info: number;
  total: number;
  /** Every issue, worst-severity first. */
  sorted: SeoIssue[];
  /** The top few, for the "priority fixes" widget. */
  priority: SeoIssue[];
  /** Count and worst-severity per area, in a stable order, for the bar chart. */
  byArea: { area: SeoIssue["area"]; n: number; worst: SeoIssue["severity"] | null }[];
};

/**
 * Derive everything the overview widgets read off a report's issue list, once.
 *
 * The overview shows the same issues sliced four ways — a severity donut, an
 * issues-by-area chart, a priority list, and a headline count. Computing each
 * slice inside its own widget re-walked the array four times and scattered the
 * same logic; this centralises it and memoises on the list identity.
 */
export function useIssueBreakdown(issues: SeoIssue[], priorityCount = 4): IssueBreakdown {
  return useMemo(() => {
    const critical = issues.filter((i) => i.severity === "critical").length;
    const warning = issues.filter((i) => i.severity === "warning").length;
    const info = issues.filter((i) => i.severity === "info").length;
    const sorted = [...issues].sort((a, b) => sevRank(a.severity) - sevRank(b.severity));
    const byArea = (Object.keys(AREA_LABEL) as SeoIssue["area"][]).map((area) => {
      const inArea = issues.filter((i) => i.area === area);
      return { area, n: inArea.length, worst: worstSeverity(inArea) };
    });
    return {
      critical,
      warning,
      info,
      total: issues.length,
      sorted,
      priority: sorted.slice(0, priorityCount),
      byArea,
    };
  }, [issues, priorityCount]);
}
