import type {
  SearchPageVital, SearchPageVitals, SearchVitalsDevice, SearchWebVital, SearchWebVitals, SeoVitalKey,
} from "@/shared/types";
import { VITALS } from "@/features/seo/components/panels/performance/vitalMeta";
import { DEMO_PROPERTY_URL } from "@/features/demo/demoSearchConsole";

const WEEK = 7 * 86_400_000;
const WEEKS = 40;
const now = Date.now();

const BASE: Record<SeoVitalKey, number> = { lcp: 2280, inp: 164, cls: 0.05, fcp: 1460, ttfb: 610 };
const SLOWDOWN: Record<SearchVitalsDevice, number> = { mobile: 1.18, all: 1, desktop: 0.78 };

const PAGES: { path: string; clicks: number; weight: number }[] = [
  { path: "/", clicks: 412, weight: 1 },
  { path: "/pricing", clicks: 268, weight: 0.92 },
  { path: "/docs", clicks: 174, weight: 0.84 },
  { path: "/blog/launch", clicks: 113, weight: 1.28 },
  { path: "/features", clicks: 73, weight: 1.06 },
];

function ratingOf(key: SeoVitalKey, p75: number): SearchWebVital["rating"] {
  const meta = VITALS.find((v) => v.key === key) ?? VITALS[0];
  return p75 <= meta.good ? "good" : p75 <= meta.poor ? "needs-improvement" : "poor";
}

function rounded(key: SeoVitalKey, value: number): number {
  return key === "cls" ? Number(value.toFixed(3)) : Math.round(value);
}

function vital(key: SeoVitalKey, device: SearchVitalsDevice): SearchWebVital {
  const target = BASE[key] * SLOWDOWN[device];
  const trend = Array.from({ length: WEEKS }, (_, i) => {
    const improving = 1 + ((WEEKS - 1 - i) / WEEKS) * 0.35;
    return rounded(key, target * improving * (1 + Math.sin(i * 1.3) * 0.025));
  });
  const p75 = trend[WEEKS - 1];
  const rating = ratingOf(key, p75);
  const good = rating === "good" ? 84 : 69;
  return {
    p75,
    previousP75: trend[WEEKS - 5],
    good,
    needsImprovement: 94 - good,
    poor: 6,
    rating,
    trend,
  };
}

export function demoSearchWebVitals(device: SearchVitalsDevice): SearchWebVitals {
  const metrics = Object.fromEntries(
    VITALS.map((v) => [v.key, vital(v.key, device)]),
  ) as SearchWebVitals["metrics"];
  return {
    status: "ready",
    device,
    origin: DEMO_PROPERTY_URL.replace(/\/$/, ""),
    passing: [metrics.lcp, metrics.inp, metrics.cls].every((m) => m?.rating === "good"),
    periods: Array.from({ length: WEEKS }, (_, i) =>
      new Date(now - (WEEKS - 1 - i) * WEEK).toISOString().slice(0, 10),
    ),
    metrics,
    fetchedAt: new Date(now).toISOString(),
  };
}

export function demoSearchPageVitals(device: SearchVitalsDevice): SearchPageVitals {
  const cell = (key: SeoVitalKey, weight: number): SearchPageVital => {
    const p75 = rounded(key, BASE[key] * SLOWDOWN[device] * weight);
    return { p75, rating: ratingOf(key, p75) };
  };
  return {
    status: "ready",
    device,
    pages: PAGES.map(({ path, clicks, weight }) => {
      const lcp = cell("lcp", weight);
      const inp = cell("inp", weight);
      const cls = cell("cls", weight);
      return {
        url: `${DEMO_PROPERTY_URL.replace(/\/$/, "")}${path}`,
        clicks,
        passing: [lcp, inp, cls].every((m) => m.rating === "good"),
        lcp,
        inp,
        cls,
      };
    }),
    fetchedAt: new Date(now).toISOString(),
  };
}
