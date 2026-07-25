import { Users, ArrowDownWideNarrow, Tag, Target } from "lucide-react";
import type { HelpSection } from "./HelpDrawer";

/**
 * In-app help for the Analytics page, grouped to mirror the page's own
 * sections — Audience, Behavior, Acquisition, Conversion — and the tabs within
 * them. Each item explains one number or panel the way a tooltip would, with
 * room to say it properly. Kept in step with the SECTIONS/tabs in Analytics.tsx
 * so the drawer never describes a view that isn't there.
 */
export const ANALYTICS_HELP: HelpSection[] = [
  {
    id: "audience",
    label: "Audience",
    icon: Users,
    blurb:
      "The headline tiles — how many people came, how much they looked at, and how many are here right now.",
    items: [
      { term: "Visitors", detail: "Distinct people in the selected period. A visitor is a privacy-friendly daily hash of IP and browser — no cookies — so the same person on two days counts twice." },
      { term: "Pageviews", detail: "Every page load, including SPA route changes. One visitor can rack up many pageviews, so this is always higher than visitors." },
      { term: "Sessions", detail: "A visit — one or more pageviews with no 30-minute gap. A returning visitor later in the day starts a fresh session." },
      { term: "Live now", detail: "Distinct visitors active in the last five minutes, updated as the page refreshes. The 'Right now' panel lists the pages they're on." },
    ],
  },
  {
    id: "behavior",
    label: "Behavior",
    icon: ArrowDownWideNarrow,
    blurb:
      "How engaged visits are, and what people do once they arrive — the Pages, Engagement and Clicks tabs.",
    items: [
      { term: "Bounce rate", detail: "Share of sessions that left after a single pageview without interacting. Lower is usually better — the delta arrow is coloured accordingly." },
      { term: "Avg. session", detail: "Average visible time across a whole visit. A backgrounded tab doesn't count, so this is real attention time, not just tab-open time." },
      { term: "Avg. time on page / Pages per session", detail: "How long a single page holds attention, and how many pages a typical visit touches. Higher pages-per-session means people explore more." },
      { term: "Pages, Entry & Exit", detail: "Your most-viewed pages, plus where visits begin (entry) and where they end (exit). Click a row to filter every number to that page." },
      { term: "Engagement & Clicks", detail: "Scroll depth and landing performance, a traffic heatmap by hour and weekday, and which CTAs get clicked and where on the page." },
    ],
  },
  {
    id: "acquisition",
    label: "Acquisition",
    icon: Tag,
    blurb:
      "Where visitors come from — the Sources, Geography and Technology tabs.",
    items: [
      { term: "Channels & Referrers", detail: "Channels group traffic into Direct, Organic, Social and Paid; Referrers name the exact sites sending it. Click a referrer to filter by it." },
      { term: "UTM sources & campaigns", detail: "Traffic tagged with campaign parameters, so you can measure a specific push separately from everything else." },
      { term: "Geography", detail: "A world map shaded by volume, plus ranked countries and browser languages — useful for deciding what to translate." },
      { term: "Technology", detail: "Browsers, operating systems, devices and screen sizes. A surprise here — lots of an old browser, say — can explain layout complaints." },
    ],
  },
  {
    id: "conversion",
    label: "Conversion",
    icon: Target,
    blurb:
      "Whether visits turn into the outcomes you care about — the Goals, Events, Funnel, Retention and Errors tabs.",
    items: [
      { term: "Goals", detail: "Completion rates for the actions you've defined as goals — the share of visitors doing the thing that matters." },
      { term: "Events", detail: "Custom events fired via rta.track(), with their totals and any revenue value summed across them." },
      { term: "Funnel", detail: "A step-by-step path you define. Each step shows how many sessions reached it and where people drop off." },
      { term: "Retention", detail: "Weekly cohorts and how many visitors come back over the following weeks — a read on whether the product holds people." },
      { term: "Errors", detail: "Client-side errors the tracker forwarded, so a broken page shows up here rather than only in complaints." },
    ],
  },
];
