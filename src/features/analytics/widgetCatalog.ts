export type WidgetKind = "metric" | "chart" | "list" | "map" | "live";

export type Span = 1 | 2 | 3 | 4;

export type Widget = {
  id: string;
  label: string;
  description: string;
  group: "Metrics" | "Charts" | "Breakdowns" | "Search";
  kind: WidgetKind;
  defaultSpan: Span;
};

export const WIDGETS = [
  { id: "visitors", label: "Visitors", description: "Unique people, with trend", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "pageviews", label: "Pageviews", description: "Total pages loaded", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "live", label: "Live now", description: "People on the site right now", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "sessions", label: "Sessions", description: "Distinct visits", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "bounce", label: "Bounce rate", description: "Left after one page", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "avgSession", label: "Avg. session", description: "Time spent per visit", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "pagesPerSession", label: "Pages / session", description: "Depth of each visit", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "sites", label: "Sites", description: "Sites in this workspace", group: "Metrics", kind: "metric", defaultSpan: 1 },

  { id: "traffic", label: "Traffic chart", description: "Views over time", group: "Charts", kind: "chart", defaultSpan: 3 },
  { id: "livePages", label: "Right now", description: "Pages being viewed live", group: "Charts", kind: "live", defaultSpan: 1 },
  { id: "worldMap", label: "World map", description: "Visitors by country", group: "Charts", kind: "map", defaultSpan: 2 },
  { id: "clicks", label: "CTA clicks", description: "Which buttons get clicked, and where", group: "Charts", kind: "list", defaultSpan: 2 },
  { id: "heatmap", label: "Traffic heatmap", description: "When your visitors show up", group: "Charts", kind: "chart", defaultSpan: 4 },
  { id: "seoScore", label: "SEO health", description: "Latest audit score for your site", group: "Charts", kind: "chart", defaultSpan: 2 },
  { id: "targets", label: "Goal progress", description: "Monthly and quarterly targets", group: "Charts", kind: "list", defaultSpan: 2 },

  { id: "topPages", label: "Top pages", description: "Most viewed pages", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "entryPages", label: "Entry pages", description: "Where visits begin", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "exitPages", label: "Exit pages", description: "Where visits end", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "topReferrers", label: "Referrers", description: "Where traffic comes from", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "topCountries", label: "Countries", description: "Top locations", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "browsers", label: "Browsers", description: "Chrome, Safari, …", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "operatingSystems", label: "Operating systems", description: "Windows, macOS, …", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "devices", label: "Devices", description: "Desktop, mobile, tablet", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "screenSizes", label: "Screen sizes", description: "Viewport width buckets", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "languages", label: "Languages", description: "Browser language", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "utmSources", label: "UTM sources", description: "Campaign sources", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "utmCampaigns", label: "UTM campaigns", description: "Campaign names", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "scrollDepth", label: "Scroll depth", description: "How far down each page people read", group: "Breakdowns", kind: "list", defaultSpan: 2 },
  { id: "landingPages", label: "Landing pages", description: "Which entry points actually hold people", group: "Breakdowns", kind: "list", defaultSpan: 2 },
  { id: "channels", label: "Channels", description: "How sessions arrive: Direct, Organic, Paid…", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "outbound", label: "Outbound & downloads", description: "Where visitors leave to", group: "Breakdowns", kind: "list", defaultSpan: 1 },
  { id: "errors", label: "JS errors", description: "Broken pages and failed scripts", group: "Breakdowns", kind: "list", defaultSpan: 1 },

  { id: "searchClicks", label: "Google clicks", description: "Clicks from Google Search results", group: "Search", kind: "metric", defaultSpan: 1 },
  { id: "searchImpressions", label: "Google impressions", description: "Times your site appeared in Google", group: "Search", kind: "metric", defaultSpan: 1 },
  { id: "searchCtr", label: "Search CTR", description: "Share of impressions that became clicks", group: "Search", kind: "metric", defaultSpan: 1 },
  { id: "searchPosition", label: "Avg. position", description: "Average ranking in Google results", group: "Search", kind: "metric", defaultSpan: 1 },
  { id: "searchTrend", label: "Search performance", description: "Google clicks and impressions over time", group: "Search", kind: "chart", defaultSpan: 4 },
  { id: "searchQueries", label: "Top search queries", description: "What people searched before finding you", group: "Search", kind: "list", defaultSpan: 2 },
  { id: "searchPages", label: "Top pages in Google", description: "Your pages that earn the most search clicks", group: "Search", kind: "list", defaultSpan: 2 },
  { id: "searchRankings", label: "Ranking positions", description: "How many queries rank top 3, page 1 and beyond", group: "Search", kind: "chart", defaultSpan: 2 },
  { id: "searchOpportunities", label: "Quick wins", description: "Queries close to page one worth improving", group: "Search", kind: "list", defaultSpan: 2 },
] as const satisfies readonly Widget[];

export type WidgetId = (typeof WIDGETS)[number]["id"];

export type Placed = { id: WidgetId; span: Span };

export const WIDGET_GROUPS = ["Metrics", "Charts", "Breakdowns", "Search"] as const;

export const WIDGET_MAP: Record<string, Widget> = Object.fromEntries(
  WIDGETS.map((w) => [w.id, w as Widget])
);

export const EMBEDDABLE_WIDGETS: WidgetId[] = [
  "visitors", "pageviews", "sessions", "live", "bounce", "avgSession", "pagesPerSession",
  "traffic", "worldMap", "heatmap",
  "topPages", "entryPages", "exitPages", "topReferrers", "topCountries", "browsers",
  "operatingSystems", "devices", "languages", "channels", "utmSources", "utmCampaigns",
];

export function isSearchWidget(id: string): boolean {
  return WIDGET_MAP[id]?.group === "Search";
}

export function isEmbeddable(id: string): id is WidgetId {
  return (EMBEDDABLE_WIDGETS as string[]).includes(id);
}
