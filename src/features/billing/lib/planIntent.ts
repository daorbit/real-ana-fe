import type { BillingCycle } from "@/shared/types";

const KEY = "quantalog_plan_intent";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type PlanIntent = { plan: string; cycle: BillingCycle };

export function storePlanIntent(plan: string | null, cycle: string | null) {
  const slug = String(plan ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32);
  if (!slug || slug === "free") return;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ plan: slug, cycle: cycle === "yearly" ? "yearly" : "monthly", at: Date.now() }),
    );
  } catch {
    return;
  }
}

export function readPlanIntent(): PlanIntent | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as
      | { plan?: string; cycle?: BillingCycle; at?: number }
      | null;
    if (!parsed?.plan || !parsed.at || Date.now() - parsed.at > MAX_AGE_MS) return null;
    return { plan: parsed.plan, cycle: parsed.cycle === "yearly" ? "yearly" : "monthly" };
  } catch {
    return null;
  }
}

export function clearPlanIntent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    return;
  }
}
