import type { SeoVitalSummary } from "@/shared/types";
import type { Tone } from "@/features/seo/components/shared/tone";

export type VitalUnit = "ms" | "s" | "";

export const VITALS = [
  {
    key: "lcp",
    label: "LCP",
    name: "Largest Contentful Paint",
    hint: "When the main content finished rendering. Good is 2.5 s or less.",
    unit: "s",
    good: 2500,
    poor: 4000,
  },
  {
    key: "inp",
    label: "INP",
    name: "Interaction to Next Paint",
    hint: "How quickly the page responds to a tap or click. Good is 200 ms or less.",
    unit: "ms",
    good: 200,
    poor: 500,
  },
  {
    key: "cls",
    label: "CLS",
    name: "Cumulative Layout Shift",
    hint: "How much the page jumps around while loading. Good is 0.1 or less.",
    unit: "",
    good: 0.1,
    poor: 0.25,
  },
  {
    key: "fcp",
    label: "FCP",
    name: "First Contentful Paint",
    hint: "When the first text or image appeared. Good is 1.8 s or less.",
    unit: "s",
    good: 1800,
    poor: 3000,
  },
  {
    key: "ttfb",
    label: "TTFB",
    name: "Time to First Byte",
    hint: "How long the server took to start responding. Good is 0.8 s or less.",
    unit: "ms",
    good: 800,
    poor: 1800,
  },
] as const satisfies readonly {
  key: string;
  label: string;
  name: string;
  hint: string;
  unit: VitalUnit;
  good: number;
  poor: number;
}[];

export type VitalMeta = (typeof VITALS)[number];

export const VITAL_RATING: Record<SeoVitalSummary["rating"], { tone: Tone; label: string }> = {
  good: { tone: "good", label: "Passing" },
  "needs-improvement": { tone: "warn", label: "Needs work" },
  poor: { tone: "bad", label: "Failing" },
  none: { tone: "neutral", label: "No data" },
};

export function formatVital(value: number | null, unit: VitalUnit): string {
  if (value === null) return "—";
  if (unit === "s") return `${(value / 1000).toFixed(1)} s`;
  if (unit === "ms") return `${Math.round(value)} ms`;
  return value.toFixed(2);
}
