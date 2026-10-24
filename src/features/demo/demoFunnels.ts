import type {
  FunnelOverviewRow,
  FunnelReport,
  FunnelResultStep,
  FunnelStepInput,
  FunnelTrendUnit,
  SavedFunnel,
} from "@/shared/types";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const RANGE_MS: Record<string, number> = { "1h": HOUR, "24h": DAY, "7d": 7 * DAY, "30d": 30 * DAY, custom: 7 * DAY };
const RANGE_SCALE: Record<string, number> = { "1h": 0.04, "24h": 1, "7d": 6.5, "30d": 27, custom: 6.5 };

export const demoSavedFunnels: SavedFunnel[] = [
  {
    id: "demo-funnel-signup",
    name: "Pricing to signup",
    steps: [
      { type: "page", value: "/" },
      { type: "page", value: "/pricing" },
      { type: "event", value: "signup_started" },
      { type: "event", value: "signup_completed" },
    ],
  },
  {
    id: "demo-funnel-docs",
    name: "Docs to install",
    steps: [
      { type: "page", value: "/docs" },
      { type: "page", value: "/docs/tracking" },
      { type: "event", value: "snippet_copied" },
    ],
  },
];

const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

function keepRate(step: FunnelStepInput, wobble: number): number {
  const seed = [...step.value].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return Math.min(0.95, 0.38 + (seed % 40) / 100 + wobble);
}

function counts(steps: FunnelStepInput[], entered: number, wobble: number): number[] {
  let count = entered;
  return steps.map((step, i) => {
    if (i > 0) count = Math.round(count * keepRate(step, wobble));
    return count;
  });
}

function trendUnit(range: string): FunnelTrendUnit {
  if (range === "1h") return "5min";
  if (range === "24h") return "hour";
  return "day";
}

export function demoFunnelOverview(range: string): FunnelOverviewRow[] {
  return demoSavedFunnels.map((funnel) => {
    const report = demoFunnelReport(funnel.steps, range);
    return {
      id: funnel.id,
      entered: report.current?.entered ?? 0,
      completed: report.current?.completed ?? 0,
      conversion: report.current?.conversion ?? 0,
      previousConversion: report.previous?.conversion ?? null,
      biggestDrop: report.biggestDrop ?? null,
    };
  });
}

export function demoFunnelReport(steps: FunnelStepInput[], range: string): FunnelReport {
  const span = RANGE_MS[range] ?? DAY;
  const until = Date.now();
  const since = until - span;
  const entered = Math.round(1840 * (RANGE_SCALE[range] ?? 1));
  const now = counts(steps, entered, 0);
  const before = counts(steps, Math.round(entered * 1.03), -0.02);

  const reportSteps: FunnelResultStep[] = steps.map((step, i) => {
    const prior = i === 0 ? now[0] : now[i - 1];
    return {
      label: step.value,
      type: step.type,
      count: now[i],
      rate: i === 0 ? 100 : percent(now[i], now[0]),
      stepRate: i === 0 ? 100 : percent(now[i], prior),
      dropFromPrev: i === 0 ? 0 : Math.round((100 - percent(now[i], prior)) * 10) / 10,
      dropped: i === 0 ? 0 : prior - now[i],
      avgSecondsFromPrev: i === 0 ? null : 25 + i * 37,
      previousCount: before[i],
    };
  });

  let biggestDrop: FunnelReport["biggestDrop"] = null;
  reportSteps.forEach((step, index) => {
    if (index === 0 || step.dropped <= 0) return;
    if (biggestDrop && step.dropped <= biggestDrop.dropped) return;
    biggestDrop = { index, dropped: step.dropped, dropFromPrev: step.dropFromPrev };
  });

  const unit = trendUnit(range);
  const size = unit === "5min" ? 5 * 60 * 1000 : unit === "hour" ? HOUR : DAY;
  const buckets = Math.max(1, Math.round(span / size));
  const last = now[now.length - 1];
  const points = Array.from({ length: buckets }, (_, i) => {
    const wave = 0.8 + ((i * 37) % 9) / 20;
    const bucketEntered = Math.max(1, Math.round((entered / buckets) * wave));
    const bucketCompleted = Math.round((last / buckets) * (i === buckets - 3 ? 0.4 : wave));
    return {
      at: new Date(since + i * size).toISOString(),
      entered: bucketEntered,
      completed: bucketCompleted,
      conversion: percent(bucketCompleted, bucketEntered),
    };
  });

  return {
    steps: reportSteps,
    current: { since: new Date(since).toISOString(), until: new Date(until).toISOString(), entered: now[0], completed: last, conversion: percent(last, now[0]) },
    previous: {
      since: new Date(since - span).toISOString(),
      until: new Date(since).toISOString(),
      entered: before[0],
      completed: before[before.length - 1],
      conversion: percent(before[before.length - 1], before[0]),
    },
    trend: { unit, points },
    biggestDrop,
  };
}
