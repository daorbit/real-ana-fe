import { useCallback, useState } from "react";

/** Visual family — decides which animated preview the picker shows. */
export type WidgetKind = "metric" | "chart" | "list" | "map" | "live";

/** How many columns of the 4-column Home grid a widget occupies. */
export type Span = 1 | 2 | 3 | 4;

export type Widget = {
  id: string;
  label: string;
  description: string;
  group: "Metrics" | "Charts" | "Breakdowns";
  kind: WidgetKind;
  /** Span applied when the widget is first added. */
  defaultSpan: Span;
};

/** A widget placed on the home page: what it is, and how wide the user made it. */
export type Placed = { id: WidgetId; span: Span };

/** Every widget the Home page can render. */
export const WIDGETS = [
  // --- metrics -----------------------------------------------------------
  { id: "visitors", label: "Visitors", description: "Unique people, with trend", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "pageviews", label: "Pageviews", description: "Total pages loaded", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "live", label: "Live now", description: "People on the site right now", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "sessions", label: "Sessions", description: "Distinct visits", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "bounce", label: "Bounce rate", description: "Left after one page", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "avgSession", label: "Avg. session", description: "Time spent per visit", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "pagesPerSession", label: "Pages / session", description: "Depth of each visit", group: "Metrics", kind: "metric", defaultSpan: 1 },
  { id: "sites", label: "Sites", description: "Sites in this workspace", group: "Metrics", kind: "metric", defaultSpan: 1 },

  // --- charts ------------------------------------------------------------
  { id: "traffic", label: "Traffic chart", description: "Views over time", group: "Charts", kind: "chart", defaultSpan: 3 },
  { id: "livePages", label: "Right now", description: "Pages being viewed live", group: "Charts", kind: "live", defaultSpan: 1 },
  { id: "worldMap", label: "World map", description: "Visitors by country", group: "Charts", kind: "map", defaultSpan: 2 },
  { id: "clicks", label: "CTA clicks", description: "Which buttons get clicked, and where", group: "Charts", kind: "list", defaultSpan: 2 },

  // --- breakdowns --------------------------------------------------------
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
] as const satisfies readonly Widget[];

export type WidgetId = (typeof WIDGETS)[number]["id"];

export const WIDGET_GROUPS = ["Metrics", "Charts", "Breakdowns"] as const;

export const WIDGET_MAP: Record<string, Widget> = Object.fromEntries(
  WIDGETS.map((w) => [w.id, w as Widget])
);

/** Home is a summary; Analytics is the full picture — so the default is small. */
const DEFAULTS: Placed[] = [
  { id: "visitors", span: 1 },
  { id: "pageviews", span: 1 },
  { id: "live", span: 1 },
  { id: "sites", span: 1 },
  { id: "traffic", span: 3 },
  { id: "livePages", span: 1 },
  { id: "topPages", span: 2 },
  { id: "topReferrers", span: 2 },
];

const KEY = "rta_home_layout";

function read(): Placed[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Placed[];
    const valid = new Set<string>(WIDGETS.map((w) => w.id));
    const kept = parsed.filter(
      (p) => p && valid.has(p.id) && [1, 2, 3, 4].includes(p.span)
    );
    return kept.length ? kept : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/**
 * The user's home layout: which widgets, in what order, and how wide each is.
 * Persisted per browser.
 */
export function useHomeWidgets() {
  const [layout, setLayout] = useState<Placed[]>(read);

  const persist = useCallback((next: Placed[]) => {
    setLayout(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage disabled — the choice just won't survive a reload */
    }
  }, []);

  const has = useCallback(
    (id: WidgetId) => layout.some((p) => p.id === id),
    [layout]
  );

  /** Add at the end with its default width, or remove if already present. */
  const toggle = useCallback(
    (id: WidgetId) => {
      if (layout.some((p) => p.id === id)) {
        persist(layout.filter((p) => p.id !== id));
      } else {
        persist([...layout, { id, span: WIDGET_MAP[id].defaultSpan }]);
      }
    },
    [layout, persist]
  );

  const remove = useCallback(
    (id: WidgetId) => persist(layout.filter((p) => p.id !== id)),
    [layout, persist]
  );

  const setSpan = useCallback(
    (id: WidgetId, span: Span) =>
      persist(layout.map((p) => (p.id === id ? { ...p, span } : p))),
    [layout, persist]
  );

  /** Move a widget to a new index — used by drag-and-drop. */
  const move = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0) return;
      const next = [...layout];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      persist(next);
    },
    [layout, persist]
  );

  const reset = useCallback(() => persist(DEFAULTS), [persist]);
  const clear = useCallback(() => persist([]), [persist]);

  return { layout, has, toggle, remove, setSpan, move, reset, clear };
}
