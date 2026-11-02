export type VitalUnit = "ms" | "s" | "";

export const VITALS = [
  {
    key: "lcp",
    label: "LCP",
    name: "Largest Contentful Paint",
    hint: "When the main content finished rendering. Good is 2.5 s or less.",
    unit: "s",
  },
  {
    key: "inp",
    label: "INP",
    name: "Interaction to Next Paint",
    hint: "How quickly the page responds to a tap or click. Good is 200 ms or less.",
    unit: "ms",
  },
  {
    key: "cls",
    label: "CLS",
    name: "Cumulative Layout Shift",
    hint: "How much the page jumps around while loading. Good is 0.1 or less.",
    unit: "",
  },
  {
    key: "fcp",
    label: "FCP",
    name: "First Contentful Paint",
    hint: "When the first text or image appeared. Good is 1.8 s or less.",
    unit: "s",
  },
  {
    key: "ttfb",
    label: "TTFB",
    name: "Time to First Byte",
    hint: "How long the server took to start responding. Good is 0.8 s or less.",
    unit: "ms",
  },
] as const satisfies readonly { key: string; label: string; name: string; hint: string; unit: VitalUnit }[];

export function formatVital(value: number | null, unit: VitalUnit): string {
  if (value === null) return "—";
  if (unit === "s") return `${(value / 1000).toFixed(1)} s`;
  if (unit === "ms") return `${Math.round(value)} ms`;
  return value.toFixed(2);
}
