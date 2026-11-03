import {
  FileSearch, Globe2, LayoutDashboard, Lightbulb, ListTree, MonitorSmartphone, Search, type LucideIcon,
} from "lucide-react";
import { countryLabel } from "@/shared/lib";
import { CountryFlag } from "@/shared/ui/CountryFlag";
import { alpha3ToAlpha2 } from "@/shared/lib/countryCodes";
import { pagePath } from "./searchMetrics";
import classes from "./components/searchConsole.module.css";

export type SearchConsoleTabId =
  | "overview"
  | "insights"
  | "queries"
  | "pages"
  | "countries"
  | "devices"
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
    id: "sitemaps",
    label: "Sitemaps",
    icon: ListTree,
    intro: "Tell Google where your pages are, and see when it last read them.",
  },
];

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
