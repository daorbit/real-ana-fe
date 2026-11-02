import type { TFunction } from "i18next";

export type AnalyticsTab = { value: string; label: string; intro: string };

export type AnalyticsSection = { value: string; label: string; tabs: AnalyticsTab[] };

export function getAnalyticsSections(t: TFunction): AnalyticsSection[] {
  return [
    { value: "overview", label: t("analytics.sec.overview"), tabs: [] },
    {
      value: "behavior",
      label: t("analytics.sec.behavior"),
      tabs: [
        { value: "pages", label: t("analytics.tab.pages"), intro: "Which pages people view, land on and leave from." },
        { value: "engagement", label: t("analytics.tab.engagement"), intro: "How far people scroll, which landing pages hold attention, and when your audience is active." },
        { value: "clicks", label: t("analytics.tab.clicks"), intro: "The buttons and links people click most, and where outbound clicks go." },
        { value: "heatmaps", label: t("analytics.tab.heatmaps", "Heatmaps"), intro: "Where clicks land on a page. Pick a page and a device." },
      ],
    },
    {
      value: "acquisition",
      label: t("analytics.sec.acquisition"),
      tabs: [
        { value: "sources", label: t("analytics.tab.sources"), intro: "The channels, referrers and campaigns that bring visitors in." },
        { value: "geo", label: t("analytics.tab.geo"), intro: "Where your visitors are and the languages they read in." },
        { value: "tech", label: t("analytics.tab.tech"), intro: "Browsers, operating systems, devices and screen sizes." },
      ],
    },
    {
      value: "conversion",
      label: t("analytics.sec.conversion"),
      tabs: [
        { value: "flow", label: t("analytics.tab.flow"), intro: "The paths visitors take from their first page, and where they leave." },
        { value: "events", label: t("analytics.tab.events"), intro: "Custom events sent with rta.track(), with conversions and revenue." },
        { value: "retention", label: t("analytics.tab.retention"), intro: "How many visitors from each week come back in the weeks after." },
        { value: "errors", label: t("analytics.tab.errors"), intro: "JavaScript errors your visitors' browsers reported." },
      ],
    },
  ];
}
