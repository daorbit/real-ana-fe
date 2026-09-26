import {
  FileSearch, Globe2, LayoutDashboard, Lightbulb, ListChecks, ListTree, MonitorSmartphone, Search, type LucideIcon,
} from "lucide-react";
import { countryFlag, countryLabel } from "@/shared/lib";
import { alpha3ToAlpha2 } from "@/shared/lib/countryCodes";
import { pagePath } from "./searchMetrics";
import classes from "./components/searchConsole.module.css";

export type SearchConsoleTabId =
  | "overview"
  | "insights"
  | "queries"
  | "pages"
  | "indexing"
  | "countries"
  | "devices"
  | "sitemaps";

export const SEARCH_CONSOLE_TABS: { id: SearchConsoleTabId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "queries", label: "Queries", icon: Search },
  { id: "pages", label: "Pages", icon: FileSearch },
  { id: "indexing", label: "Indexing", icon: ListChecks },
  { id: "countries", label: "Countries", icon: Globe2 },
  { id: "devices", label: "Devices", icon: MonitorSmartphone },
  { id: "sitemaps", label: "Sitemaps", icon: ListTree },
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
      <span aria-hidden>{countryFlag(code)}</span>
      {countryLabel(code)}
    </span>
  );
}
