import { priceIn } from "@/shared/lib/currency";
import type { AddonPack, AddonSelection, Currency, Plan, QuotaSummary } from "@/shared/types";

export function yearlySaving(plan: Plan, currency: Currency): { amount: number; percent: number } {
  const monthlyTotal = priceIn(plan.priceMonthly, currency) * 12;
  const yearly = priceIn(plan.priceYearly, currency);
  const amount = Math.max(0, monthlyTotal - yearly);
  const percent = monthlyTotal > 0 ? Math.round((amount / monthlyTotal) * 100) : 0;
  return { amount, percent };
}

function perCredit(pack: AddonPack, currency: Currency): number {
  return pack.quantity > 0 ? priceIn(pack.price, currency) / pack.quantity : 0;
}

function baseRate(pack: AddonPack, addons: AddonPack[], currency: Currency): number {
  return addons
    .filter((p) => p.type === pack.type)
    .reduce((max, p) => Math.max(max, perCredit(p, currency)), 0);
}

export function packDiscount(pack: AddonPack, addons: AddonPack[], currency: Currency): { percent: number; perPack: number } {
  const base = baseRate(pack, addons, currency);
  const rate = perCredit(pack, currency);
  if (!base || rate >= base) return { percent: 0, perPack: 0 };
  return {
    percent: Math.round((1 - rate / base) * 100),
    perPack: Math.round(base * pack.quantity - priceIn(pack.price, currency)),
  };
}

export function bulkSaving(addons: AddonPack[], selection: AddonSelection, currency: Currency): number {
  return addons.reduce(
    (sum, pack) => sum + packDiscount(pack, addons, currency).perPack * (selection[pack.slug] ?? 0),
    0,
  );
}

export function creditBalance(usage: QuotaSummary, type: string): number | null {
  if (!usage) return null;
  const left = (quota: number, used: number, addon: number) => Math.max(0, quota - used) + addon;
  switch (type) {
    case "audit":
      return left(usage.audits.planQuota, usage.audits.used, usage.audits.addonCredits);
    case "crawl":
      return left(usage.crawls.planQuota, usage.crawls.used, usage.crawls.addonCredits);
    case "orbit":
      return usage.orbit ? left(usage.orbit.planQuota, usage.orbit.used, usage.orbit.addonCredits) : null;
    case "form-submissions":
      return usage.forms
        ? left(usage.forms.submissionQuota, usage.forms.submissionsUsed, usage.forms.addonCredits)
        : null;
    default:
      return null;
  }
}
