import type { Placed } from "@/features/analytics/widgetCatalog";

export type LayoutPreset = { id: string; label: string; description: string; layout: Placed[] };

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "essentials",
    label: "Essentials",
    description: "Headline numbers and the traffic trend",
    layout: [
      { id: "visitors", span: 1 },
      { id: "pageviews", span: 1 },
      { id: "live", span: 1 },
      { id: "bounce", span: 1 },
      { id: "traffic", span: 4 },
      { id: "topPages", span: 2 },
      { id: "topReferrers", span: 2 },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Channels, campaigns and conversions",
    layout: [
      { id: "visitors", span: 1 },
      { id: "sessions", span: 1 },
      { id: "bounce", span: 1 },
      { id: "avgSession", span: 1 },
      { id: "traffic", span: 4 },
      { id: "channels", span: 1 },
      { id: "utmSources", span: 1 },
      { id: "goals", span: 2 },
      { id: "utmCampaigns", span: 2 },
      { id: "landingPages", span: 2 },
    ],
  },
  {
    id: "content",
    label: "Content",
    description: "Which pages hold readers",
    layout: [
      { id: "pageviews", span: 1 },
      { id: "pagesPerSession", span: 1 },
      { id: "avgSession", span: 1 },
      { id: "bounce", span: 1 },
      { id: "topPages", span: 2 },
      { id: "scrollDepth", span: 2 },
      { id: "entryPages", span: 1 },
      { id: "exitPages", span: 1 },
      { id: "clicks", span: 2 },
    ],
  },
  {
    id: "search",
    label: "Search",
    description: "Google Search Console at a glance",
    layout: [
      { id: "searchClicks", span: 1 },
      { id: "searchImpressions", span: 1 },
      { id: "searchCtr", span: 1 },
      { id: "searchPosition", span: 1 },
      { id: "searchTrend", span: 4 },
      { id: "searchQueries", span: 2 },
      { id: "searchOpportunities", span: 2 },
    ],
  },
  {
    id: "live",
    label: "Live monitor",
    description: "What's happening right now",
    layout: [
      { id: "live", span: 1 },
      { id: "visitors", span: 1 },
      { id: "pageviews", span: 1 },
      { id: "sites", span: 1 },
      { id: "livePages", span: 2 },
      { id: "worldMap", span: 2 },
      { id: "heatmap", span: 4 },
    ],
  },
];
