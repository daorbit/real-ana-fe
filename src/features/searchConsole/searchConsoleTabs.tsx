import { FileSearch, Globe2, LayoutDashboard, ListTree, MonitorSmartphone, Search, type LucideIcon } from "lucide-react";
import { countryFlag, countryLabel } from "@/shared/lib";
import { alpha3ToAlpha2 } from "@/shared/lib/countryCodes";
import type { SearchBreakdownRow } from "@/shared/types";
import { pagePath } from "./searchMetrics";
import classes from "./components/searchConsole.module.css";

export type SearchConsoleTabId = "overview" | "queries" | "pages" | "countries" | "devices" | "sitemaps";

export const SEARCH_CONSOLE_TABS: { id: SearchConsoleTabId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "queries", label: "Queries", icon: Search },
  { id: "pages", label: "Pages", icon: FileSearch },
  { id: "countries", label: "Countries", icon: Globe2 },
  { id: "devices", label: "Devices", icon: MonitorSmartphone },
  { id: "sitemaps", label: "Sitemaps", icon: ListTree },
];

export function resolveTab(value: string | null): SearchConsoleTabId {
  return SEARCH_CONSOLE_TABS.some((t) => t.id === value) ? (value as SearchConsoleTabId) : "overview";
}

export const queryText = (row: SearchBreakdownRow) => row.key;

export const pageText = (row: SearchBreakdownRow) => pagePath(row.key);

export const countryText = (row: SearchBreakdownRow) => countryLabel(alpha3ToAlpha2(row.key));

export function renderQuery(row: SearchBreakdownRow) {
  return row.key;
}

export function renderPage(row: SearchBreakdownRow) {
  return (
    <a href={row.key} target="_blank" rel="noopener noreferrer" className={classes.pageLink}>
      {pagePath(row.key)}
    </a>
  );
}

export function renderCountry(row: SearchBreakdownRow) {
  const code = alpha3ToAlpha2(row.key);
  return (
    <span className={classes.countryLabel}>
      <span aria-hidden>{countryFlag(code)}</span>
      {countryLabel(code)}
    </span>
  );
}
