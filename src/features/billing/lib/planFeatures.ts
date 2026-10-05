import type { TFunction } from "i18next";
import { priceIn } from "@/shared/lib/currency";
import { MAX_SITES_PER_WORKSPACE } from "@/shared/types";
import type { Currency, Plan } from "@/shared/types";

export const CARD_FEATURE_LIMIT = 8;

export function planFeatureLines(plan: Plan, t: TFunction): string[] {
  return [
    t("billing.featureSites", { count: MAX_SITES_PER_WORKSPACE }),
    t("billing.featureAudits", { count: plan.monthlyAuditQuota }),
    t("billing.featureCrawls", { count: plan.monthlyCrawlQuota }),
    t("billing.featureRecipients", { count: plan.maxReportRecipients }),
    ...plan.features,
  ];
}

export function allPlanFeatures(plans: Plan[]): string[] {
  const seen: string[] = [];
  for (const plan of plans) {
    for (const f of plan.features) if (!seen.includes(f)) seen.push(f);
  }
  return seen;
}

export function featuredPlanSlug(plans: Plan[], currentSlug: string | null, currency: Currency): string | null {
  if (!plans.length) return null;
  const sorted = [...plans].sort(
    (a, b) => priceIn(a.priceMonthly, currency) - priceIn(b.priceMonthly, currency),
  );
  const currentIdx = currentSlug ? sorted.findIndex((p) => p.slug === currentSlug) : -1;
  const next = currentIdx >= 0 ? sorted[currentIdx + 1] : sorted[sorted.length - 2];
  return next?.slug ?? sorted[sorted.length - 1]?.slug ?? null;
}
