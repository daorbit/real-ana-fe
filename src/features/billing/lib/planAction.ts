import { priceIn } from "@/shared/lib/currency";
import type { BillingCycle, Currency, Plan, QuotaSummary } from "@/shared/types";
import { daysUntil } from "./usageMonth";

export const RENEW_WITHIN_DAYS = 7;

export type PlanAction =
  | { kind: "demo" }
  | { kind: "current" }
  | { kind: "renew" }
  | { kind: "switchCycle"; to: BillingCycle }
  | { kind: "lower"; currentName: string }
  | { kind: "free" }
  | { kind: "subscribe" };

export function planAction({
  plan,
  usage,
  expired,
  lower,
  cycle,
  currency,
  isDemo,
}: {
  plan: Plan;
  usage: QuotaSummary;
  expired: boolean;
  lower: boolean;
  cycle: BillingCycle;
  currency: Currency;
  isDemo: boolean;
}): PlanAction {
  if (isDemo) return { kind: "demo" };

  const price = priceIn(cycle === "yearly" ? plan.priceYearly : plan.priceMonthly, currency);
  const onThisPlan = usage?.plan.slug === plan.slug && !expired;

  if (onThisPlan && price > 0 && usage?.cycle !== cycle) return { kind: "switchCycle", to: cycle };

  if (onThisPlan) {
    const daysLeft = usage?.currentPeriodEnd ? daysUntil(usage.currentPeriodEnd) : null;
    const dueSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= RENEW_WITHIN_DAYS;
    return price > 0 && dueSoon ? { kind: "renew" } : { kind: "current" };
  }

  if (lower) return { kind: "lower", currentName: usage?.plan.name ?? "" };
  if (price === 0) return { kind: "free" };
  if (expired && usage?.plan.slug === plan.slug) return { kind: "renew" };
  return { kind: "subscribe" };
}

export function isActionable(action: PlanAction): boolean {
  return action.kind === "renew" || action.kind === "switchCycle" || action.kind === "subscribe";
}
