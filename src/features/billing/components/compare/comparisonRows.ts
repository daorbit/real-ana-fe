import type { TFunction } from "i18next";
import { MAX_SITES_PER_WORKSPACE } from "@/shared/types";
import type { Plan } from "@/shared/types";

export type ComparisonRow = {
  label: string;
  value: (plan: Plan) => string | boolean;
};

export function limitRows(t: TFunction): ComparisonRow[] {
  return [
    { label: t("billing.compareSites", "Sites per workspace"), value: () => String(MAX_SITES_PER_WORKSPACE) },
    { label: t("billing.compareAudits", "SEO audits / month"), value: (p) => p.monthlyAuditQuota.toLocaleString() },
    { label: t("billing.compareCrawls", "Site crawls / month"), value: (p) => p.monthlyCrawlQuota.toLocaleString() },
    { label: t("billing.compareRecipients", "Report recipients"), value: (p) => String(p.maxReportRecipients) },
  ];
}

export function featureRows(features: string[]): ComparisonRow[] {
  return features.map((f) => ({ label: f, value: (p) => p.features.includes(f) }));
}
