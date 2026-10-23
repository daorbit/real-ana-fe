import type { BillingCycle, Plan, QuotaSummary } from "@/shared/types";

const MIN_START_LEAD_MS = 60 * 60 * 1000;

export type AutoRenewTerms = {
  renewalLive: boolean;
  alreadyRenewing: boolean;
  scheduledSwitch: boolean;
  deferred: boolean;
  firstChargeAt: string | null;
};

export function renewsInto(usage: QuotaSummary): { planSlug: string; cycle: BillingCycle } | null {
  if (!usage?.renewal?.autoRenew) return null;
  return {
    planSlug: usage.renewal.planSlug ?? usage.plan.slug,
    cycle: usage.renewal.cycle ?? usage.cycle,
  };
}

export function isLowerPlan(plans: Plan[], usage: QuotaSummary, plan: Plan): boolean {
  if (!usage || usage.status === "expired") return false;
  const currentIndex = plans.findIndex((p) => p.slug === usage.plan.slug);
  const index = plans.findIndex((p) => p.slug === plan.slug);
  return currentIndex > -1 && index > -1 && index < currentIndex;
}

export function autoRenewTerms(usage: QuotaSummary, plan: Plan, cycle: BillingCycle, lower: boolean): AutoRenewTerms {
  const renewal = renewsInto(usage);
  const periodEnd = usage?.currentPeriodEnd ?? null;
  const live = !!usage && usage.status !== "expired";
  const sameTerm = live && usage!.plan.slug === plan.slug && usage!.cycle === cycle;
  const scheduledSwitch = live && lower;
  const deferred =
    (sameTerm || scheduledSwitch) && !!periodEnd && new Date(periodEnd).getTime() - Date.now() > MIN_START_LEAD_MS;

  return {
    renewalLive: !!renewal,
    alreadyRenewing: !!renewal && renewal.planSlug === plan.slug && renewal.cycle === cycle,
    scheduledSwitch,
    deferred,
    firstChargeAt: deferred ? periodEnd : null,
  };
}
