import { useCallback, useState } from "react";

/** Visual family — decides which animated preview the picker shows. */
export type WidgetKind = "metric" | "chart" | "list" | "map" | "live";

/** How much horizontal room a widget takes in the Home grid. */
export type WidgetSize = "sm" | "md" | "lg";

export type Widget = {
  id: string;
  label: string;
  description: string;
  group: "Metrics" | "Charts" | "Breakdowns";
  kind: WidgetKind;
  size: WidgetSize;
};

/** Every widget the Home page can render. Order here is display order. */
export const WIDGETS = [
  // --- metrics -----------------------------------------------------------
  { id: "visitors", label: "Visitors", description: "Unique people, with trend", group: "Metrics", kind: "metric", size: "sm" },
  { id: "pageviews", label: "Pageviews", description: "Total pages loaded", group: "Metrics", kind: "metric", size: "sm" },
  { id: "live", label: "Live now", description: "People on the site right now", group: "Metrics", kind: "metric", size: "sm" },
  { id: "sessions", label: "Sessions", description: "Distinct visits", group: "Metrics", kind: "metric", size: "sm" },
  { id: "bounce", label: "Bounce rate", description: "Left after one page", group: "Metrics", kind: "metric", size: "sm" },
  { id: "avgSession", label: "Avg. session", description: "Time spent per visit", group: "Metrics", kind: "metric", size: "sm" },
  { id: "pagesPerSession", label: "Pages / session", description: "Depth of each visit", group: "Metrics", kind: "metric", size: "sm" },
  { id: "sites", label: "Sites", description: "Sites in this workspace", group: "Metrics", kind: "metric", size: "sm" },

  // --- charts ------------------------------------------------------------
  { id: "traffic", label: "Traffic chart", description: "Views over time", group: "Charts", kind: "chart", size: "lg" },
  { id: "livePages", label: "Right now", description: "Pages being viewed live", group: "Charts", kind: "live", size: "md" },
  { id: "worldMap", label: "World map", description: "Visitors by country", group: "Charts", kind: "map", size: "lg" },
  { id: "clicks", label: "CTA clicks", description: "Which buttons get clicked, and where", group: "Charts", kind: "list", size: "md" },

  // --- breakdowns --------------------------------------------------------
  { id: "topPages", label: "Top pages", description: "Most viewed pages", group: "Breakdowns", kind: "list", size: "md" },
  { id: "entryPages", label: "Entry pages", description: "Where visits begin", group: "Breakdowns", kind: "list", size: "md" },
  { id: "exitPages", label: "Exit pages", description: "Where visits end", group: "Breakdowns", kind: "list", size: "md" },
  { id: "topReferrers", label: "Referrers", description: "Where traffic comes from", group: "Breakdowns", kind: "list", size: "md" },
  { id: "topCountries", label: "Countries", description: "Top locations", group: "Breakdowns", kind: "list", size: "md" },
  { id: "browsers", label: "Browsers", description: "Chrome, Safari, …", group: "Breakdowns", kind: "list", size: "md" },
  { id: "operatingSystems", label: "Operating systems", description: "Windows, macOS, …", group: "Breakdowns", kind: "list", size: "md" },
  { id: "devices", label: "Devices", description: "Desktop, mobile, tablet", group: "Breakdowns", kind: "list", size: "md" },
  { id: "screenSizes", label: "Screen sizes", description: "Viewport width buckets", group: "Breakdowns", kind: "list", size: "md" },
  { id: "languages", label: "Languages", description: "Browser language", group: "Breakdowns", kind: "list", size: "md" },
  { id: "utmSources", label: "UTM sources", description: "Campaign sources", group: "Breakdowns", kind: "list", size: "md" },
  { id: "utmCampaigns", label: "UTM campaigns", description: "Campaign names", group: "Breakdowns", kind: "list", size: "md" },
] as const satisfies readonly Widget[];

export type WidgetId = (typeof WIDGETS)[number]["id"];

export const WIDGET_GROUPS = ["Metrics", "Charts", "Breakdowns"] as const;

/** A deliberately small default: Home is a summary, Analytics is the full picture. */
const DEFAULTS: WidgetId[] = ["visitors", "pageviews", "live", "traffic", "topPages"];

const KEY = "rta_home_widgets";

function read(): WidgetId[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as WidgetId[];
    const valid = new Set<string>(WIDGETS.map((w) => w.id));
    const kept = parsed.filter((id) => valid.has(id));
    return kept.length ? kept : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/** Which Home widgets the user has enabled. Persisted per browser. */
export function useHomeWidgets() {
  const [enabled, setEnabled] = useState<WidgetId[]>(read);

  const persist = useCallback((next: WidgetId[]) => {
    setEnabled(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage disabled — the choice just won't survive a reload */
    }
  }, []);

  const toggle = useCallback(
    (id: WidgetId) => {
      persist(enabled.includes(id) ? enabled.filter((w) => w !== id) : [...enabled, id]);
    },
    [enabled, persist]
  );

  const reset = useCallback(() => persist(DEFAULTS), [persist]);
  const clear = useCallback(() => persist([]), [persist]);
  const has = useCallback((id: WidgetId) => enabled.includes(id), [enabled]);

  return { enabled, has, toggle, reset, clear };
}
