import type { SearchIndexCheck, SearchIndexing, SearchIndexState } from "@/shared/types";
import { DEMO_PROPERTY_URL } from "@/features/demo/demoSearchConsole";

const DAY = 86_400_000;
const now = Date.now();
const iso = (days: number) => new Date(now - days * DAY).toISOString();

type Sample = {
  path: string;
  clicks: number | null;
  state?: SearchIndexState;
  reason?: string;
  crawled?: number;
  rich?: SearchIndexCheck["richResults"];
};

const SAMPLES: Sample[] = [
  { path: "", clicks: 412, state: "indexed", reason: "Submitted and indexed", crawled: 1 },
  {
    path: "pricing", clicks: 268, state: "indexed", reason: "Submitted and indexed", crawled: 2,
    rich: [{ type: "PRODUCT_SNIPPETS", issues: 0 }],
  },
  { path: "docs", clicks: 174, state: "indexed", reason: "Submitted and indexed", crawled: 3 },
  {
    path: "blog/launch", clicks: 113, state: "indexed", reason: "Submitted and indexed", crawled: 2,
    rich: [{ type: "ARTICLE", issues: 1 }],
  },
  { path: "features", clicks: 73, state: "indexed", reason: "Submitted and indexed", crawled: 4 },
  { path: "docs/api", clicks: 46, state: "indexed", reason: "Submitted and indexed", crawled: 5 },
  { path: "blog/2025-recap", clicks: null, state: "not_indexed", reason: "Crawled - currently not indexed", crawled: 21 },
  { path: "blog/tag/deploys", clicks: null, state: "not_indexed", reason: "Crawled - currently not indexed", crawled: 30 },
  { path: "docs/webhooks", clicks: null, state: "not_indexed", reason: "Discovered - currently not indexed" },
  { path: "old-pricing", clicks: null, state: "not_indexed", reason: "Page with redirect", crawled: 12 },
  { path: "thank-you", clicks: null, state: "blocked", reason: "Excluded by 'noindex' tag", crawled: 9 },
  { path: "changelog/archive", clicks: null, state: "blocked", reason: "Blocked by robots.txt" },
  { path: "about", clicks: 18 },
  { path: "changelog", clicks: 11 },
  { path: "careers", clicks: null },
];

export function demoSearchIndexing(): SearchIndexing {
  return {
    sitemapPages: SAMPLES.length,
    days: 28,
    pages: SAMPLES.map(({ path, clicks, state, reason, crawled, rich }) => ({
      url: `${DEMO_PROPERTY_URL}${path}`,
      inSitemap: true,
      clicks,
      check: state
        ? {
            state,
            reason: reason ?? "",
            lastCrawled: crawled === undefined ? null : iso(crawled),
            richResults: rich ?? [],
            checkedAt: iso(1),
          }
        : null,
    })),
  };
}
