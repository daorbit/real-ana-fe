import {
  AlertTriangle, Bot, Braces, FileText, Gauge, History, Image as ImageIcon, Layers,
  LayoutDashboard, Link2, Search, Tags, Wrench,
  type LucideIcon,
} from "lucide-react";

export type SeoSectionId =
  | "overview"
  | "search"
  | "issues"
  | "meta"
  | "content"
  | "images"
  | "schema"
  | "technical"
  | "performance"
  | "links"
  | "crawl"
  | "ai"
  | "history";

export interface SeoSection {
  id: SeoSectionId;
  label: string;
  icon: LucideIcon;
  /** One line under the section title that says what the section is for. */
  description: string;
}

export interface SeoSectionGroup {
  /** Null for the ungrouped items at the top and bottom of the nav. */
  label: string | null;
  items: SeoSection[];
}

/**
 * The report's navigation, grouped the way Search Console groups its reports:
 * a summary first, then what Google sees, what to fix, and the page- and
 * site-level checks behind the score.
 */
export const SEO_NAV: SeoSectionGroup[] = [
  {
    label: null,
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
        description: "The page's score, how it's trending, and the fixes that matter most.",
      },
    ],
  },
  {
    label: "Search",
    items: [
      {
        id: "search",
        label: "Search traffic",
        icon: Search,
        description: "Clicks, impressions and the queries that bring people to this site from Google.",
      },
    ],
  },
  {
    label: "Fix",
    items: [
      {
        id: "issues",
        label: "Issues",
        icon: AlertTriangle,
        description: "Every problem the audit found on this page, worst first.",
      },
    ],
  },
  {
    label: "Page checks",
    items: [
      {
        id: "meta",
        label: "Meta tags",
        icon: Tags,
        description: "How the page appears in search results and when shared on social media.",
      },
      {
        id: "content",
        label: "Content",
        icon: FileText,
        description: "Headings, word count, readability and the keywords the page leans on.",
      },
      {
        id: "images",
        label: "Images",
        icon: ImageIcon,
        description: "Alt text, dimensions and lazy loading for each image on the page.",
      },
      {
        id: "schema",
        label: "Structured data",
        icon: Braces,
        description: "Schema.org markup that makes the page eligible for rich results.",
      },
    ],
  },
  {
    label: "Site health",
    items: [
      {
        id: "performance",
        label: "Page speed",
        icon: Gauge,
        description: "Core Web Vitals from real visitors, Lighthouse lab scores, and what to speed up.",
      },
      {
        id: "technical",
        label: "Technical",
        icon: Wrench,
        description: "HTTPS, redirects, robots.txt, sitemap and the other basics crawlers rely on.",
      },
      {
        id: "links",
        label: "Links",
        icon: Link2,
        description: "Broken links, redirects and server errors among the links on this page.",
      },
      {
        id: "crawl",
        label: "Site crawl",
        icon: Layers,
        description: "Pages found by following links from the home page, and the issues across them.",
      },
      {
        id: "ai",
        label: "AI search",
        icon: Bot,
        description: "Whether AI assistants and answer engines can read and cite this site.",
      },
    ],
  },
  {
    label: null,
    items: [
      {
        id: "history",
        label: "Audit history",
        icon: History,
        description: "Every past audit of this site. Open one to see how the page scored then.",
      },
    ],
  },
];

export const SEO_SECTIONS: SeoSection[] = SEO_NAV.flatMap((g) => g.items);

export function isSeoSection(value: string | null): value is SeoSectionId {
  return SEO_SECTIONS.some((s) => s.id === value);
}

/** Older links used `suggestions` for what is now part of Page speed. */
export function normalizeSeoSection(value: string | null): SeoSectionId {
  if (value === "suggestions") return "performance";
  return isSeoSection(value) ? value : "overview";
}
