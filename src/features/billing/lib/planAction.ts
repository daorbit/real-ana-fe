import { priceIn } from "@/shared/lib/currency";
import type { BillingCycle, Currency, Plan, QuotaSummary } from "@/shared/types";
import { renewsInto } from "./autoRenew";
import { daysUntil } from "./usageMonth";

export const RENEW_WITHIN_DAYS = 7;

export type PlanAction =
  | { kind: "demo" }
  | { kind: "current" }
  | { kind: "renew" }
  | { kind: "keep" }
  | { kind: "switchCycle"; to: BillingCycle }
  | { kind: "downgrade" }
  | { kind: "scheduled" }
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
  const renewal = expired ? null : renewsInto(usage);
  const renewsAsThis = !!renewal && renewal.planSlug === plan.slug && renewal.cycle === cycle;

  if (onThisPlan && price > 0 && usage?.cycle !== cycle) {
    return renewsAsThis ? { kind: "scheduled" } : { kind: "switchCycle", to: cycle };
  }

  if (onThisPlan) {
    if (renewal) return renewsAsThis ? { kind: "current" } : { kind: "keep" };
    const daysLeft = usage?.currentPeriodEnd ? daysUntil(usage.currentPeriodEnd) : null;
    const dueSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= RENEW_WITHIN_DAYS;
    return price > 0 && dueSoon ? { kind: "renew" } : { kind: "current" };
  }

  if (lower) {
    if (price === 0) return { kind: "lower", currentName: usage?.plan.name ?? "" };
    return renewsAsThis ? { kind: "scheduled" } : { kind: "downgrade" };
  }
  if (price === 0) return { kind: "free" };
  if (expired && usage?.plan.slug === plan.slug) return { kind: "renew" };
  return { kind: "subscribe" };
}

export function isActionable(action: PlanAction): boolean {
  return (
    action.kind === "renew" ||
    action.kind === "keep" ||
    action.kind === "switchCycle" ||
    action.kind === "downgrade" ||
    action.kind === "subscribe"
  );
}
