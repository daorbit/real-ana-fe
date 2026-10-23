import type { BillingCycle, Plan, QuotaSummary } from "@/shared/types";

const MIN_START_LEAD_MS = 60 * 60 * 1000;

export type AutoRenewTerms = {
  renewalLive: boolean;
  alreadyRenewing: boolean;
  deferred: boolean;
  firstChargeAt: string | null;
};

export function autoRenewTerms(usage: QuotaSummary, plan: Plan, cycle: BillingCycle): AutoRenewTerms {
  const renewalLive = Boolean(usage?.renewal?.autoRenew);
  const periodEnd = usage?.currentPeriodEnd ?? null;
  const sameTerm =
    !!usage && usage.status !== "expired" && usage.plan.slug === plan.slug && usage.cycle === cycle;
  const deferred =
    sameTerm && !!periodEnd && new Date(periodEnd).getTime() - Date.now() > MIN_START_LEAD_MS;

  return {
    renewalLive,
    alreadyRenewing: renewalLive && sameTerm,
    deferred,
    firstChargeAt: deferred ? periodEnd : null,
  };
}
