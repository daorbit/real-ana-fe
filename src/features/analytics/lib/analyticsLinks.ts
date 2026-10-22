import type { StatsFilter } from "@/shared/types";

const VIEW_FOR_FILTER: Record<keyof StatsFilter, { section: string; tab: string }> = {
  path: { section: "behavior", tab: "pages" },
  referrer: { section: "acquisition", tab: "sources" },
  utmSource: { section: "acquisition", tab: "sources" },
  utmMedium: { section: "acquisition", tab: "sources" },
  utmCampaign: { section: "acquisition", tab: "sources" },
  country: { section: "acquisition", tab: "geo" },
  language: { section: "acquisition", tab: "geo" },
  browser: { section: "acquisition", tab: "tech" },
  os: { section: "acquisition", tab: "tech" },
  device: { section: "acquisition", tab: "tech" },
  eventName: { section: "conversion", tab: "events" },
};

export function analyticsFilterHref(key: keyof StatsFilter, value: string): string {
  const { section, tab } = VIEW_FOR_FILTER[key];
  const params = new URLSearchParams({ section, tab, [key]: value });
  return `/app/analytics?${params.toString()}`;
}
