import type { ComponentType } from "react";
import type { TFunction } from "i18next";
import { Activity, Search, Globe2, Layers, ClipboardList, FileSearch } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { compact, num } from "@/shared/lib";
import type { QuotaSummary } from "@/shared/types";

export type UsageMeterData = {
  key: string;
  icon: ComponentType<{ size?: number }>;
  label: string;
  used: number;
  quota: number;
  credits: number;
};

export function formatAllowance(n: number): string {
  return n >= 100_000 ? compact(n) : num(n);
}

export function buildUsageMeters(usage: NonNullable<QuotaSummary>, t: TFunction): UsageMeterData[] {
  const meters: UsageMeterData[] = [
    { key: "events", icon: Activity, label: t("billing.usageEvents"), used: usage.events.used, quota: usage.events.planQuota, credits: 0 },
    { key: "audits", icon: Search, label: t("billing.usageAudits"), used: usage.audits.used, quota: usage.audits.planQuota, credits: usage.audits.addonCredits },
    { key: "crawls", icon: Globe2, label: t("billing.usageCrawls"), used: usage.crawls.used, quota: usage.crawls.planQuota, credits: usage.crawls.addonCredits },
    { key: "sites", icon: Layers, label: t("billing.usageSites"), used: usage.sites.used, quota: usage.sites.quota, credits: 0 },
  ];

  if (usage.orbit) {
    meters.push({
      key: "orbit",
      icon: OrbitMark,
      label: t("billing.usageOrbit"),
      used: usage.orbit.used,
      quota: usage.orbit.planQuota,
      credits: usage.orbit.addonCredits,
    });
  }

  if (usage.forms) {
    meters.push({
      key: "forms",
      icon: ClipboardList,
      label: t("billing.usageFormResponses"),
      used: usage.forms.submissionsUsed,
      quota: usage.forms.submissionQuota,
      credits: usage.forms.addonCredits,
    });
  }

  if (usage.search && usage.search.inspections.planQuota > 0) {
    meters.push({
      key: "inspections",
      icon: FileSearch,
      label: t("billing.usageIndexChecks", "Google index checks"),
      used: usage.search.inspections.used,
      quota: usage.search.inspections.planQuota,
      credits: usage.search.inspections.addonCredits,
    });
  }

  return meters;
}
