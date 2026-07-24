import { Gauge, LineChart, Layers } from "lucide-react";
import type { HelpSection } from "./HelpDrawer";

/**
 * In-app help for the home / analytics widgets, grouped the way the widget
 * picker groups them. Each item explains one widget — the same thing a tooltip
 * would say, with room to say it properly.
 */
export const ANALYTICS_HELP: HelpSection[] = [
  {
    id: "metrics",
    label: "Headline metrics",
    icon: Gauge,
    blurb:
      "The single-number tiles at the top of the overview. Each shows a total for the last 24 hours with its change against the day before.",
    items: [
      { term: "Visitors", detail: "Unique people, counted once no matter how many pages they view. This is your real audience size." },
      { term: "Pageviews", detail: "Every page load, including repeat views by the same person. Always higher than visitors." },
      { term: "Live now", detail: "People active on the site in the last five minutes. Updates as you watch." },
      { term: "Sessions", detail: "Distinct visits. One person coming back later in the day is two sessions but one visitor." },
      { term: "Bounce rate", detail: "The share of sessions that left after a single page. A lower number here is better — the arrow is coloured accordingly." },
      { term: "Avg. session", detail: "How long a typical visit lasts. Longer usually means the content is holding attention." },
      { term: "Pages / session", detail: "How many pages a visit covers on average — a measure of how far people explore." },
    ],
  },
  {
    id: "charts",
    label: "Charts",
    icon: LineChart,
    blurb:
      "The visual panels — traffic over time, the world map, click and scroll behaviour. These show shape and trend rather than a single figure.",
    items: [
      { term: "Traffic chart", detail: "Views over the selected range, so you can see peaks, dips and the daily rhythm at a glance." },
      { term: "Right now", detail: "The pages people are viewing live, refreshing in real time — useful during a launch or campaign." },
      { term: "World map", detail: "Where visitors are, shaded by volume. Hover a country for its exact count." },
      { term: "CTA clicks", detail: "Which buttons and calls-to-action get clicked, and where on the page — so you know what's working." },
      { term: "Traffic heatmap", detail: "When your visitors show up, across the hours of the day and days of the week. Time your posts to the bright cells." },
    ],
  },
  {
    id: "breakdowns",
    label: "Breakdowns",
    icon: Layers,
    blurb:
      "The ranked lists — top pages, sources, countries, devices and the rest. Each answers a 'which are the top…?' question about your traffic.",
    items: [
      { term: "Top pages", detail: "Your most-viewed pages. Entry and exit variants show where visits begin and end." },
      { term: "Referrers", detail: "The sites sending you traffic. Channels groups them into Direct, Organic, Social and Paid." },
      { term: "Countries & languages", detail: "Who's visiting and what language their browser is set to — useful for deciding what to translate." },
      { term: "Devices, browsers, OS", detail: "What people view the site on. A surprise here (lots of an old browser, say) can explain layout complaints." },
      { term: "UTM sources & campaigns", detail: "Traffic tagged with campaign parameters, so you can measure a specific push separately from everything else." },
      { term: "Conversions", detail: "Goal completion rates — the share of visitors doing the thing you actually care about." },
    ],
  },
];
