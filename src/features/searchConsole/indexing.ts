import type { Tone } from "@/features/seo/components/shared/tone";
import type { SearchIndexPage, SearchIndexState } from "@/shared/types";
import { humanizeCode } from "./searchAppearance";

export type IndexFilter = "all" | "indexed" | "not_indexed" | "blocked" | "unchecked";

export const INDEX_STATES: Record<SearchIndexState, { label: string; tone: Tone }> = {
  indexed: { label: "On Google", tone: "good" },
  not_indexed: { label: "Not on Google", tone: "bad" },
  blocked: { label: "Blocked", tone: "warn" },
  failed: { label: "Couldn't check", tone: "neutral" },
};

const REASON_HINTS: { match: RegExp; hint: string }[] = [
  { match: /crawled.*not indexed/i, hint: "Google read it but left it out. Make the content more useful and link to it." },
  { match: /discovered.*not indexed/i, hint: "Google knows the address but hasn't read it yet. Link to it from strong pages." },
  { match: /unknown to google/i, hint: "Google hasn't found it. Add it to your sitemap and link to it." },
  { match: /alternate page/i, hint: "Usually fine. Google shows the main version instead." },
  { match: /duplicate/i, hint: "Google sees it as a copy. Set a canonical or make it distinct." },
  { match: /redirect error/i, hint: "The redirect loops or breaks. Fix where it points." },
  { match: /redirect/i, hint: "Usually fine. List the final address in your sitemap instead." },
  { match: /soft 404/i, hint: "It looks empty to Google. Add content or return a real 404." },
  { match: /404|not found/i, hint: "The page is missing. Restore it, redirect it, or remove it from your sitemap." },
  { match: /5xx|server error/i, hint: "Your server failed when Google visited. Check it is stable." },
  { match: /noindex/i, hint: "A noindex tag keeps it out. Remove the tag if you want it on Google." },
  { match: /robots/i, hint: "robots.txt stops Google reading it. Allow it if you want it on Google." },
  { match: /401|403|unauthori|forbidden/i, hint: "Google isn't allowed in. Open the page to visitors who aren't signed in." },
];

export function reasonHint(reason: string): string | null {
  return REASON_HINTS.find(({ match }) => match.test(reason))?.hint ?? null;
}

export function matchesIndexFilter(page: SearchIndexPage, filter: IndexFilter): boolean {
  if (filter === "all") return true;
  if (filter === "unchecked") return !page.check || page.check.state === "failed";
  return page.check?.state === filter;
}

export type IndexCounts = Record<IndexFilter, number> & { checked: number };

export function indexCounts(pages: SearchIndexPage[]): IndexCounts {
  const count = (filter: IndexFilter) => pages.filter((page) => matchesIndexFilter(page, filter)).length;
  const unchecked = count("unchecked");
  return {
    all: pages.length,
    indexed: count("indexed"),
    not_indexed: count("not_indexed"),
    blocked: count("blocked"),
    unchecked,
    checked: pages.length - unchecked,
  };
}

export type IndexReason = { reason: string; state: SearchIndexState; pages: number };

export function indexReasons(pages: SearchIndexPage[]): IndexReason[] {
  const groups = new Map<string, IndexReason>();
  for (const { check } of pages) {
    if (!check || check.state === "indexed" || check.state === "failed") continue;
    const group = groups.get(check.reason) ?? { reason: check.reason, state: check.state, pages: 0 };
    group.pages += 1;
    groups.set(check.reason, group);
  }
  return [...groups.values()].sort((a, b) => b.pages - a.pages);
}

export type RichResultGroup = { type: string; label: string; pages: number; withIssues: number };

export function richResultGroups(pages: SearchIndexPage[]): RichResultGroup[] {
  const groups = new Map<string, RichResultGroup>();
  for (const { check } of pages) {
    for (const { type, issues } of check?.richResults ?? []) {
      const group = groups.get(type) ?? { type, label: humanizeCode(type), pages: 0, withIssues: 0 };
      group.pages += 1;
      if (issues > 0) group.withIssues += 1;
      groups.set(type, group);
    }
  }
  return [...groups.values()].sort((a, b) => b.pages - a.pages);
}
