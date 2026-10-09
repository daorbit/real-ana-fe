import { timeAgo } from "@/shared/lib";
import type {
  SeoCompareBaseline, SeoCompareSnapshot, SeoCompetitorComparison, SeoReadIssue,
} from "@/shared/types";

export const BASELINE_ID = "__you__";

const DAY = 24 * 60 * 60 * 1000;

export const SKEW_AFTER_DAYS = 2;

export type TrustNotice = { id: string; tone: "warn" | "info"; text: string };

export function readIssueText(issue: SeoReadIssue, statusCode: number): string {
  if (issue === "blocked") {
    return "Their site served a bot check or blocked our request instead of the page. Nothing from this fetch is real page data, so it is left out of the standings.";
  }
  return `Their server answered with HTTP ${statusCode}, so we never saw the page. It is left out of the standings until a refresh succeeds.`;
}

function hiddenContent(snapshot: SeoCompareSnapshot): boolean {
  return Boolean(snapshot.quality?.clientRendered);
}

export function comparisonNotices(
  comparison: SeoCompetitorComparison,
  mine: SeoCompareSnapshot,
  baseline: SeoCompareBaseline,
): TrustNotice[] {
  const notices: TrustNotice[] = [];

  if (comparison.lastError && comparison.lastErrorAt) {
    notices.push({
      id: "refresh-failed",
      tone: "warn",
      text: `The last refresh ${timeAgo(comparison.lastErrorAt)} failed (${comparison.lastError}). You are looking at the previous successful fetch${comparison.lastCheckedAt ? ` from ${timeAgo(comparison.lastCheckedAt)}` : ""}.`,
    });
  }

  if (baseline.source === "audit") {
    notices.push({
      id: "baseline-audit",
      tone: "info",
      text: "Your side comes from your last SEO audit, not a fresh fetch. Compare again to measure both pages at the same moment with the same method.",
    });
  } else if (baseline.lastError) {
    notices.push({
      id: "baseline-failed",
      tone: "warn",
      text: `We could not re-fetch your own page (${baseline.lastError}). Your side is from the last successful fetch.`,
    });
  }

  if (baseline.checkedAt && comparison.lastCheckedAt) {
    const skew = Math.abs(new Date(baseline.checkedAt).getTime() - new Date(comparison.lastCheckedAt).getTime()) / DAY;
    if (skew > SKEW_AFTER_DAYS) {
      notices.push({
        id: "skew",
        tone: "warn",
        text: `Your page and theirs were measured ${Math.round(skew)} days apart. Compare again for a like-for-like reading.`,
      });
    }
  }

  if (hiddenContent(comparison.snapshot) || hiddenContent(mine)) {
    const who = hiddenContent(comparison.snapshot) && hiddenContent(mine)
      ? "Both pages build"
      : hiddenContent(mine) ? "Your page builds" : "Their page builds";
    notices.push({
      id: "client-rendered",
      tone: "info",
      text: `${who} most of their text with JavaScript after loading. We read the HTML the server sends, as many crawlers do, so word count, headings and topic gaps are not compared.`,
    });
  }

  const redirected = comparison.snapshot.quality?.redirectedHost;
  if (redirected) {
    notices.push({
      id: "redirected",
      tone: "info",
      text: `This URL redirected to ${redirected}, so the numbers describe that page, not the address you added.`,
    });
  }

  return notices;
}

export function measuredTogether(baseline: SeoCompareBaseline, comparison: SeoCompetitorComparison): boolean {
  if (baseline.source !== "live" || !baseline.checkedAt || !comparison.lastCheckedAt) return false;
  const gap = Math.abs(new Date(baseline.checkedAt).getTime() - new Date(comparison.lastCheckedAt).getTime());
  return gap < SKEW_AFTER_DAYS * DAY;
}
