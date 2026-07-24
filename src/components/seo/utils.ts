import type { SeoIssue, SeoStrategyResult } from "../../types";

/**
 * Pure presentation helpers shared across the SEO panels.
 *
 * Kept framework-free (no JSX) so any panel or widget can import them without
 * dragging component code along.
 */

/** Emerald-band colour for a 0-100 score. The focal figure is emerald; the
 *  three tiers below it read as the semantic good/warn/bad. */
export function bandHex(score: number | null): string {
  if (score === null) return "var(--muted)";
  if (score >= 90) return "var(--mantine-color-teal-6)";
  if (score >= 50) return "var(--mantine-color-yellow-6)";
  return "var(--mantine-color-red-6)";
}

/** A severity's bar/rail colour, or a neutral track when there is nothing. */
export function severityHex(s: SeoIssue["severity"] | null): string {
  if (s === "critical") return "var(--mantine-color-red-6)";
  if (s === "warning") return "var(--mantine-color-yellow-6)";
  if (s === "info") return "var(--mantine-color-emerald-6)";
  return "var(--surface-2)";
}

/** Sort key: critical first, then warning, then info. */
export function sevRank(s: SeoIssue["severity"]): number {
  return s === "critical" ? 0 : s === "warning" ? 1 : 2;
}

/** Human labels for the areas an issue can belong to. */
export const AREA_LABEL: Record<SeoIssue["area"], string> = {
  meta: "Meta",
  content: "Content",
  technical: "Technical",
  files: "Crawler files",
};

/** The server reports HTML bytes as a string; show it as something readable. */
export function pageSize(contentLength: string): string {
  const bytes = Number(contentLength);
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Flesch bands, named — a bare "48" means nothing without the scale. */
export function readabilityBand(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "Easy to read", color: "teal" };
  if (score >= 50) return { label: "Fairly readable", color: "yellow" };
  if (score >= 30) return { label: "Difficult", color: "orange" };
  return { label: "Very difficult", color: "red" };
}

/** Google's own "good" thresholds for the metrics it treats as Core Web Vitals. */
export const METRIC_ROWS: {
  key: keyof SeoStrategyResult["metrics"];
  label: string;
  unit: "ms" | "s" | "";
  good: number;
}[] = [
  { key: "largestContentfulPaint", label: "Largest Contentful Paint", unit: "s", good: 2500 },
  { key: "firstContentfulPaint", label: "First Contentful Paint", unit: "s", good: 1800 },
  { key: "speedIndex", label: "Speed Index", unit: "s", good: 3400 },
  { key: "interactive", label: "Time to Interactive", unit: "s", good: 3800 },
  { key: "totalBlockingTime", label: "Total Blocking Time", unit: "ms", good: 200 },
  { key: "cumulativeLayoutShift", label: "Cumulative Layout Shift", unit: "", good: 0.1 },
];
