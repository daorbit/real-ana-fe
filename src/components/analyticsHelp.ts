import { Users, ArrowDownWideNarrow, Tag, Target } from "lucide-react";
import type { TFunction } from "i18next";
import type { HelpSection } from "./HelpDrawer";

/**
 * In-app help for the Analytics page, grouped to mirror the page's own
 * sections — Audience, Behavior, Acquisition, Conversion — and the tabs within
 * them. Each item explains one number or panel the way a tooltip would, with
 * room to say it properly.
 *
 * Only the structure lives here; the strings come from the `help.analytics`
 * namespace so the drawer follows the chosen language. Keys are
 * `<section>Label` / `<section>Blurb`, and `<section><Item>T` / `…D` for each
 * item's term and detail. Kept in step with the SECTIONS/tabs in Analytics.tsx
 * so the drawer never describes a view that isn't there.
 */
const SPEC = [
  { id: "audience", icon: Users, items: ["Visitors", "Pageviews", "Sessions", "Live"] },
  { id: "behavior", icon: ArrowDownWideNarrow, items: ["Bounce", "AvgSession", "TimePage", "Pages", "Engagement"] },
  { id: "acquisition", icon: Tag, items: ["Channels", "Utm", "Geo", "Tech"] },
  { id: "conversion", icon: Target, items: ["Goals", "Events", "Funnel", "Retention", "Errors"] },
] as const;

/** Resolve the Analytics help into translated sections. */
export function getAnalyticsHelp(t: TFunction): HelpSection[] {
  return SPEC.map((s) => ({
    id: s.id,
    icon: s.icon,
    label: t(`help.analytics.${s.id}Label`),
    blurb: t(`help.analytics.${s.id}Blurb`),
    items: s.items.map((stem) => ({
      term: t(`help.analytics.${s.id}${stem}T`),
      detail: t(`help.analytics.${s.id}${stem}D`),
    })),
  }));
}
