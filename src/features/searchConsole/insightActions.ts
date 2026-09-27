import { num } from "@/shared/lib";
import type { SearchInsightRow, SearchInsights, SearchLostRow } from "@/shared/types";
import { METRIC_BY_KEY, pagePath } from "./searchMetrics";

export type ActionKind = "opportunity" | "declining" | "growing";

export type InsightAction = {
  id: string;
  kind: ActionKind;
  dimension: "query" | "page";
  target: string;
  title: string;
  detail: string;
  impact: string;
  score: number;
};

export const ACTION_KINDS: { id: ActionKind; label: string }[] = [
  { id: "opportunity", label: "Opportunities" },
  { id: "declining", label: "Declining" },
  { id: "growing", label: "Growing" },
];

const fmtPos = (p: number) => METRIC_BY_KEY.position.format(p);
const fmtCtr = (c: number) => METRIC_BY_KEY.ctr.format(c);

function clickDelta(row: SearchInsightRow) {
  return row.clicks - (row.previousClicks ?? 0);
}

function label(dimension: "query" | "page", key: string) {
  return dimension === "page" ? pagePath(key) : `“${key}”`;
}

export function buildActions(data: SearchInsights): InsightAction[] {
  const actions: InsightAction[] = [];

  for (const row of data.lowCtr) {
    const missed = row.missedClicks ?? 0;
    actions.push({
      id: `ctr-${row.key}`,
      kind: "opportunity",
      dimension: "query",
      target: row.key,
      title: `Improve click-through for ${label("query", row.key)}`,
      detail: `Ranks ${fmtPos(row.position)} with ${num(row.impressions)} impressions, but only ${fmtCtr(row.ctr)} click. Sharpen the page title and description.`,
      impact: `~${num(missed)} more clicks`,
      score: missed,
    });
  }

  for (const row of data.quickWins) {
    const goal = row.position <= 10 ? "into the top 3" : "onto page 1";
    const potential = Math.max(1, Math.round(row.impressions * (row.position <= 10 ? 0.12 : 0.04) - row.clicks));
    actions.push({
      id: `win-${row.key}`,
      kind: "opportunity",
      dimension: "query",
      target: row.key,
      title: `Push ${label("query", row.key)} ${goal}`,
      detail: `Ranks ${fmtPos(row.position)} with ${num(row.impressions)} impressions. Expand the content and add internal links to the ranking page.`,
      impact: `~${num(potential)} more clicks`,
      score: potential,
    });
  }

  const declining = (rows: SearchInsightRow[], dimension: "query" | "page") => {
    for (const row of rows) {
      const lost = -clickDelta(row);
      actions.push({
        id: `down-${dimension}-${row.key}`,
        kind: "declining",
        dimension,
        target: row.key,
        title: dimension === "page" ? `Recover ${label(dimension, row.key)}` : `${label(dimension, row.key)} is slipping`,
        detail: `Down from ${num(row.previousClicks ?? 0)} to ${num(row.clicks)} clicks${row.previousPosition ? `, position ${fmtPos(row.previousPosition)} → ${fmtPos(row.position)}` : ""}.`,
        impact: `−${num(lost)} clicks`,
        score: lost * 1.5,
      });
    }
  };
  declining(data.fallingPages, "page");
  declining(data.fallingQueries, "query");

  for (const row of data.lostQueries as SearchLostRow[]) {
    actions.push({
      id: `lost-${row.key}`,
      kind: "declining",
      dimension: "query",
      target: row.key,
      title: `Lost all clicks for ${label("query", row.key)}`,
      detail: `Brought ${num(row.previousClicks)} clicks last period and none now. Check the page that used to rank still exists and is indexed.`,
      impact: `−${num(row.previousClicks)} clicks`,
      score: row.previousClicks * 1.5,
    });
  }

  const growing = (rows: SearchInsightRow[], dimension: "query" | "page", isNew = false) => {
    for (const row of rows) {
      const gained = isNew ? row.clicks : clickDelta(row);
      actions.push({
        id: `up-${dimension}-${isNew ? "new-" : ""}${row.key}`,
        kind: "growing",
        dimension,
        target: row.key,
        title: isNew ? `New demand: ${label(dimension, row.key)}` : `${label(dimension, row.key)} is gaining`,
        detail: isNew
          ? `Started bringing clicks this period at position ${fmtPos(row.position)}. Make sure the page fully answers it.`
          : `Up from ${num(row.previousClicks ?? 0)} to ${num(row.clicks)} clicks. Refresh it and link to it while momentum lasts.`,
        impact: `+${num(gained)} clicks`,
        score: gained,
      });
    }
  };
  growing(data.risingPages, "page");
  growing(data.risingQueries, "query");
  growing(data.newQueries, "query", true);

  return actions.sort((a, b) => b.score - a.score);
}

export type Mover = { key: string; label: string; delta: number; dimension: "query" | "page" };

export function buildMovers(data: SearchInsights, dimension: "query" | "page", limit = 6) {
  const rising = dimension === "page" ? data.risingPages : data.risingQueries;
  const falling = dimension === "page" ? data.fallingPages : data.fallingQueries;
  const toMover = (row: SearchInsightRow): Mover => ({
    key: row.key,
    label: dimension === "page" ? pagePath(row.key) : row.key,
    delta: clickDelta(row),
    dimension,
  });
  return {
    winners: rising.slice(0, limit).map(toMover),
    losers: falling.slice(0, limit).map(toMover),
  };
}
