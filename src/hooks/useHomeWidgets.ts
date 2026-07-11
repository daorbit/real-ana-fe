import { useCallback, useState } from "react";

/** Every widget the Home page can render. Order here is the display order. */
export const WIDGETS = [
  { id: "visitors", label: "Visitors", group: "Metrics" },
  { id: "pageviews", label: "Pageviews", group: "Metrics" },
  { id: "live", label: "Live now", group: "Metrics" },
  { id: "sessions", label: "Sessions", group: "Metrics" },
  { id: "bounce", label: "Bounce rate", group: "Metrics" },
  { id: "avgSession", label: "Avg. session", group: "Metrics" },
  { id: "pagesPerSession", label: "Pages / session", group: "Metrics" },
  { id: "sites", label: "Sites", group: "Metrics" },

  { id: "traffic", label: "Traffic chart", group: "Panels" },
  { id: "livePages", label: "Right now (active pages)", group: "Panels" },
  { id: "topPages", label: "Top pages", group: "Panels" },
  { id: "topReferrers", label: "Top referrers", group: "Panels" },
  { id: "topCountries", label: "Top countries", group: "Panels" },
] as const;

export type WidgetId = (typeof WIDGETS)[number]["id"];

/** A deliberately small default: Home is a summary, Analytics is the full picture. */
const DEFAULTS: WidgetId[] = ["visitors", "pageviews", "live", "traffic", "topPages"];

const KEY = "rta_home_widgets";

function read(): WidgetId[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as WidgetId[];
    const valid = new Set(WIDGETS.map((w) => w.id as string));
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
      /* storage disabled — preference just won't survive a reload */
    }
  }, []);

  const toggle = useCallback(
    (id: WidgetId) => {
      persist(
        enabled.includes(id) ? enabled.filter((w) => w !== id) : [...enabled, id]
      );
    },
    [enabled, persist]
  );

  const reset = useCallback(() => persist(DEFAULTS), [persist]);

  const has = useCallback((id: WidgetId) => enabled.includes(id), [enabled]);

  return { enabled, has, toggle, reset };
}
