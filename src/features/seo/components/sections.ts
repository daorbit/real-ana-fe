import type { LucideIcon } from "lucide-react";

/** A block inside a grouped tab, reachable by a jump link. */
export type SeoSubId =
  | "meta" | "content" | "images" | "schema"
  | "technical" | "links" | "crawl" | "ai";

export type SeoTabId = "overview" | "issues" | "onpage" | "performance" | "site" | "search";

export interface SeoSub {
  id: SeoSubId;
  label: string;
  description: string;
}

export interface SeoTab {
  id: SeoTabId;
  label: string;
  /** One line under the tab bar that says what the tab is for. */
  description: string;
  /** Grouped tabs stack these blocks on one page, with jump links. */
  subs?: SeoSub[];
  /** The help drawer section this tab opens at. */
  helpId: string;
  icon?: LucideIcon;
}

/**
 * Six tabs, grouped the way people check a page: the summary, what to fix,
 * what's on the page, how fast it is, the site around it, and what Google
 * sends. Related checks share one scrolling tab rather than a tab each.
 */
export const SEO_TABS: SeoTab[] = [
  {
    id: "overview",
    label: "Overview",
    description: "The page's score, how it's trending, and the fixes that matter most.",
    helpId: "overview",
  },
  {
    id: "issues",
    label: "Issues",
    description: "Every problem the audit found on this page, worst first.",
    helpId: "issues",
  },
  {
    id: "onpage",
    label: "On-page",
    description: "What's on the page itself: tags, copy, images and markup.",
    helpId: "meta",
    subs: [
      { id: "meta", label: "Meta tags", description: "How the page appears in search results and when shared." },
      { id: "content", label: "Content", description: "Headings, word count, readability and the keywords the page leans on." },
      { id: "images", label: "Images", description: "Alt text, dimensions and lazy loading for each image." },
      { id: "schema", label: "Structured data", description: "Schema.org markup that makes the page eligible for rich results." },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    description: "Core Web Vitals from real visitors, Lighthouse lab scores, and what to speed up.",
    helpId: "performance",
  },
  {
    id: "site",
    label: "Site health",
    description: "The site around the page: server setup, links, crawlability and AI access.",
    helpId: "technical",
    subs: [
      { id: "technical", label: "Technical", description: "HTTPS, response, robots.txt, sitemap and the basics crawlers rely on." },
      { id: "links", label: "Links", description: "Broken links, redirects and server errors among this page's links." },
      { id: "crawl", label: "Site crawl", description: "Pages found by following links from the home page." },
      { id: "ai", label: "AI search", description: "Whether AI assistants and answer engines can read and cite the site." },
    ],
  },
  {
    id: "search",
    label: "Search traffic",
    description: "Clicks, impressions and the queries that bring people here from Google.",
    helpId: "search",
  },
];

const TAB_IDS = SEO_TABS.map((t) => t.id);

/** Where an old `?section=` value lands now: its tab, and the block within it. */
export function resolveSeoSection(value: string | null): {
  tab: SeoTabId;
  sub?: SeoSubId;
  history?: boolean;
} {
  if (!value) return { tab: "overview" };
  if ((TAB_IDS as string[]).includes(value)) return { tab: value as SeoTabId };
  if (value === "suggestions") return { tab: "performance" };
  if (value === "history") return { tab: "overview", history: true };
  for (const t of SEO_TABS) {
    const sub = t.subs?.find((s) => s.id === value);
    if (sub) return { tab: t.id, sub: sub.id };
  }
  return { tab: "overview" };
}
