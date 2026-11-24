import {
  FileCheck2, FileSearch, Gauge, Globe2, LayoutDashboard, LayoutList, Lightbulb, Link2, ListTree,
  MonitorSmartphone, Search, type LucideIcon,
} from "lucide-react";
import { countryLabel } from "@/shared/lib";
import { CountryFlag } from "@/shared/ui/CountryFlag";
import { alpha3ToAlpha2 } from "@/shared/lib/countryCodes";
import { appearanceLabel } from "./searchAppearance";
import { pagePath } from "./searchMetrics";
import classes from "./components/searchConsole.module.css";

export type SearchConsoleTabId =
  | "overview"
  | "insights"
  | "queries"
  | "pages"
  | "countries"
  | "devices"
  | "appearance"
  | "vitals"
  | "indexing"
  | "links"
  | "sitemaps";

export const SEARCH_CONSOLE_TABS: { id: SearchConsoleTabId; label: string; icon: LucideIcon; intro: string }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    intro: "Clicks, impressions and rankings from Google, with your top queries and pages.",
  },
  {
    id: "insights",
    label: "Insights",
    icon: Lightbulb,
    intro: "Your Google data turned into a ranked to-do list: quick wins, slipping pages and new demand.",
  },
  { id: "queries", label: "Queries", icon: Search, intro: "Every search that showed your site in Google results." },
  {
    id: "pages",
    label: "Pages",
    icon: FileSearch,
    intro: "Your pages that appeared in Google results, with their index status one tap away.",
  },
  { id: "countries", label: "Countries", icon: Globe2, intro: "Where the people searching are." },
  {
    id: "devices",
    label: "Devices",
    icon: MonitorSmartphone,
    intro: "How mobile, desktop and tablet searchers find and click on you.",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: LayoutList,
    intro: "The special result types Google shows your pages in, and the clicks each one earns.",
  },
  {
    id: "vitals",
    label: "Web vitals",
    icon: Gauge,
    intro: "How fast and steady your pages are for real Chrome visitors, the same data Google ranks on.",
  },
  {
    id: "indexing",
    label: "Indexing",
    icon: FileCheck2,
    intro: "Which of your pages are on Google, and the reason for each one that isn't.",
  },
  {
    id: "links",
    label: "Links",
    icon: Link2,
    intro: "The sites linking to you, the pages they link to and the words they use.",
  },
  {
    id: "sitemaps",
    label: "Sitemaps",
    icon: ListTree,
    intro: "Tell Google where your pages are, and see when it last read them.",
  },
];

const UNFILTERED_TABS: SearchConsoleTabId[] = ["vitals", "indexing", "links", "sitemaps"];

export function tabHasFilters(tab: SearchConsoleTabId): boolean {
  return !UNFILTERED_TABS.includes(tab);
}

export function resolveTab(value: string | null): SearchConsoleTabId {
  return SEARCH_CONSOLE_TABS.some((t) => t.id === value) ? (value as SearchConsoleTabId) : "overview";
}

export function queryText(row: { key: string }) {
  return row.key;
}

export function pageText(row: { key: string }) {
  return pagePath(row.key);
}

export function countryText(row: { key: string }) {
  const code = alpha3ToAlpha2(row.key);
  return countryLabel(code);
}

export function appearanceText(row: { key: string }) {
  return appearanceLabel(row.key);
}

export function renderQuery(row: { key: string }) {
  return row.key;
}

export function renderPage(row: { key: string }) {
  return (
    <a
      href={row.key}
      target="_blank"
      rel="noopener noreferrer"
      className={classes.pageLink}
      onClick={(e) => e.stopPropagation()}
    >
      {pagePath(row.key)}
    </a>
  );
}

export function renderCountry(row: { key: string }) {
  const code = alpha3ToAlpha2(row.key);
  return (
    <span className={classes.countryLabel}>
      <CountryFlag code={code} />
      {countryLabel(code)}
    </span>
  );
}
