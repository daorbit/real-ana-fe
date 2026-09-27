import type { ReactNode } from "react";
import {
  MousePointerClick, Sparkles, Target, TrendingDown, TrendingUp, Unlink, type LucideIcon,
} from "lucide-react";
import { num } from "@/shared/lib";
import type { SearchInsights } from "@/shared/types";
import { METRIC_BY_KEY, pagePath } from "./searchMetrics";
import { ClickChange, ClickDelta, PositionChip } from "./components/SearchCells";

export type InsightItem = {
  key: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
  previousClicks?: number | null;
  previousImpressions?: number;
  missedClicks?: number;
};

export type InsightColumn = { label: string; render: (row: InsightItem) => ReactNode };

export type InsightGroup = "opportunities" | "growing" | "attention";

export type InsightDef = {
  id: string;
  group: InsightGroup;
  icon: LucideIcon;
  tone: "good" | "warn" | "bad";
  title: string;
  description: string;
  action: string;
  dimension: "query" | "page";
  columns: InsightColumn[];
  highlight: (row: InsightItem) => ReactNode;
  rows: (data: SearchInsights) => InsightItem[];
  emptyText: string;
};

export const INSIGHT_GROUPS: { id: InsightGroup; label: string; hint: string; tone: "info" | "good" | "bad" }[] = [
  { id: "opportunities", label: "Opportunities", hint: "Easy ranking and click gains", tone: "info" },
  { id: "growing", label: "Growing", hint: "What's gaining traction", tone: "good" },
  { id: "attention", label: "Needs attention", hint: "Drops worth checking", tone: "bad" },
];

const clicks: InsightColumn = { label: "Clicks", render: (r) => METRIC_BY_KEY.clicks.format(r.clicks ?? 0) };
const impressions: InsightColumn = {
  label: "Impressions",
  render: (r) => METRIC_BY_KEY.impressions.format(r.impressions ?? 0),
};
const ctr: InsightColumn = { label: "CTR", render: (r) => METRIC_BY_KEY.ctr.format(r.ctr ?? 0) };
const position: InsightColumn = { label: "Position", render: (r) => <PositionChip position={r.position ?? 0} /> };
const delta: InsightColumn = {
  label: "Change",
  render: (r) => <ClickDelta clicks={r.clicks ?? 0} previousClicks={r.previousClicks ?? null} />,
};
const pct: InsightColumn = {
  label: "%",
  render: (r) => <ClickChange clicks={r.clicks ?? 0} previousClicks={r.previousClicks ?? null} />,
};

export const INSIGHTS: InsightDef[] = [
  {
    id: "quick-wins",
    group: "opportunities",
    icon: Target,
    tone: "good",
    title: "Quick wins",
    description: "Queries ranking in positions 4–20 with real search demand.",
    action:
      "Strengthen the ranking page: cover the query directly in the title and a heading, expand the content, and add internal links to it.",
    dimension: "query",
    columns: [impressions, position, clicks],
    highlight: (r) => `${num(r.impressions ?? 0)} impr.`,
    rows: (d) => d.quickWins,
    emptyText: "No near-miss queries right now.",
  },
  {
    id: "low-ctr",
    group: "opportunities",
    icon: MousePointerClick,
    tone: "warn",
    title: "Low click-through",
    description: "On page 1, but earning fewer clicks than that position normally gets.",
    action:
      "Rewrite the page title and meta description so they match the searcher's intent and stand out in results.",
    dimension: "query",
    columns: [
      impressions,
      ctr,
      position,
      { label: "Missed clicks", render: (r) => `~${num(r.missedClicks ?? 0)}` },
    ],
    highlight: (r) => `~${num(r.missedClicks ?? 0)} missed clicks`,
    rows: (d) => d.lowCtr,
    emptyText: "Click-through looks healthy for your top-ranking queries.",
  },
  {
    id: "rising-queries",
    group: "growing",
    icon: TrendingUp,
    tone: "good",
    title: "Rising queries",
    description: "Biggest gains in clicks compared with the previous period.",
    action: "Double down: refresh the ranking page and link to it from related content while momentum lasts.",
    dimension: "query",
    columns: [clicks, delta, pct, position],
    highlight: (r) => <ClickDelta clicks={r.clicks ?? 0} previousClicks={r.previousClicks ?? null} />,
    rows: (d) => d.risingQueries,
    emptyText: "No queries gained clicks this period.",
  },
  {
    id: "rising-pages",
    group: "growing",
    icon: TrendingUp,
    tone: "good",
    title: "Rising pages",
    description: "Pages gaining the most clicks from Google.",
    action: "Make sure these pages convert well — add clear calls to action and links to your key pages.",
    dimension: "page",
    columns: [clicks, delta, pct, position],
    highlight: (r) => <ClickDelta clicks={r.clicks ?? 0} previousClicks={r.previousClicks ?? null} />,
    rows: (d) => d.risingPages,
    emptyText: "No pages gained clicks this period.",
  },
  {
    id: "new-queries",
    group: "growing",
    icon: Sparkles,
    tone: "good",
    title: "New queries",
    description: "Bringing clicks now, with no clicks in the previous period.",
    action: "Check the page Google picked for each one really answers it — new demand is easy to win early.",
    dimension: "query",
    columns: [clicks, impressions, position],
    highlight: (r) => `${num(r.clicks ?? 0)} clicks`,
    rows: (d) => d.newQueries,
    emptyText: "No new queries this period.",
  },
  {
    id: "falling-queries",
    group: "attention",
    icon: TrendingDown,
    tone: "bad",
    title: "Falling queries",
    description: "Biggest drops in clicks compared with the previous period.",
    action: "Search the query yourself: see who overtook you, then update your page to be more complete and current.",
    dimension: "query",
    columns: [clicks, delta, pct, position],
    highlight: (r) => <ClickDelta clicks={r.clicks ?? 0} previousClicks={r.previousClicks ?? null} />,
    rows: (d) => d.fallingQueries,
    emptyText: "No queries lost clicks this period.",
  },
  {
    id: "falling-pages",
    group: "attention",
    icon: TrendingDown,
    tone: "bad",
    title: "Falling pages",
    description: "Pages losing the most clicks from Google.",
    action: "Open the page to see which queries dropped, and check it still loads, is indexed and has fresh content.",
    dimension: "page",
    columns: [clicks, delta, pct, position],
    highlight: (r) => <ClickDelta clicks={r.clicks ?? 0} previousClicks={r.previousClicks ?? null} />,
    rows: (d) => d.fallingPages,
    emptyText: "No pages lost clicks this period.",
  },
  {
    id: "lost-queries",
    group: "attention",
    icon: Unlink,
    tone: "bad",
    title: "Lost queries",
    description: "Brought clicks in the previous period and none now.",
    action: "A page may have been changed, removed or de-indexed. Check that the page that used to rank still exists.",
    dimension: "query",
    columns: [
      { label: "Clicks before", render: (r) => num(r.previousClicks ?? 0) },
      { label: "Impressions before", render: (r) => num(r.previousImpressions ?? 0) },
    ],
    highlight: (r) => `${num(r.previousClicks ?? 0)} clicks before`,
    rows: (d) => d.lostQueries,
    emptyText: "No queries dropped away this period.",
  },
];

export function insightLabel(def: InsightDef, row: InsightItem): string {
  return def.dimension === "page" ? pagePath(row.key) : row.key;
}
