import { TEMPLATES } from "@/features/dashboards/templates";
import type { Dashboard } from "@/features/dashboards/types";
import type { TargetProgress } from "@/features/goals/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export const demoDashboards: Dashboard[] = TEMPLATES.filter((t) => t.layout.length > 0).map((t, i) => ({
  id: `demo-dashboard-${t.id}`,
  name: `${t.name} dashboard`,
  description: t.description,
  template: t.id,
  range: t.range,
  layout: t.layout,
  createdAt: new Date(Date.now() - (i + 3) * DAY_MS).toISOString(),
  updatedAt: new Date(Date.now() - (i + 1) * 3_600_000).toISOString(),
}));

function monthWindow() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const elapsed = (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
  return {
    periodKey: start.toISOString().slice(0, 7),
    periodLabel: start.toLocaleDateString("en", { month: "long", year: "numeric", timeZone: "UTC" }),
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    elapsed,
    daysLeft: Math.max(0, Math.ceil((end.getTime() - now.getTime()) / DAY_MS)),
  };
}

export function demoTargets(): TargetProgress[] {
  const w = monthWindow();
  const visitors = Math.round(10_000 * Math.min(1.1, w.elapsed * 1.15));
  const forms = Math.round(500 * Math.min(1, w.elapsed * 0.82));

  return [
    {
      id: "demo-target-visitors", name: "10K visitors this month", metric: "visitors", target: 10_000,
      period: "month", siteId: "", direction: "above", ...w,
      status: "ok", reason: null, current: visitors, progress: Math.min(1, visitors / 10_000),
      achieved: visitors >= 10_000, projected: Math.round(visitors / Math.max(w.elapsed, 0.05)),
    },
    {
      id: "demo-target-forms", name: "500 form submissions this month", metric: "formSubmissions", target: 500,
      period: "month", siteId: "", direction: "above", ...w,
      status: "ok", reason: null, current: forms, progress: Math.min(1, forms / 500),
      achieved: forms >= 500, projected: Math.round(forms / Math.max(w.elapsed, 0.05)),
    },
    {
      id: "demo-target-position", name: "Average position under 5", metric: "searchPosition", target: 5,
      period: "month", siteId: "", direction: "below", ...w,
      status: "ok", reason: null, current: 6.2, windowLabel: "Last 28 days", progress: 5 / 6.2,
      achieved: false, projected: null,
    },
  ];
}
