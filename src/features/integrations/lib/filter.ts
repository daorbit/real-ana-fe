import type { IntegrationTile } from "../types";

export type ConnectionState = "connected" | "attention" | "available" | "soon";

export type StatusFilter = "all" | "connected" | "attention" | "available";

export const ALL_CATEGORIES = "all";

export interface ConnectionFilter {
  query: string;
  status: StatusFilter;
  category: string;
}

export interface Searchable {
  name: string;
  description: string;
  group: string;
  state: ConnectionState;
}

export const EMPTY_FILTER: ConnectionFilter = { query: "", status: "all", category: ALL_CATEGORIES };

export function tileState(tile: IntegrationTile): ConnectionState {
  if (tile.enabled) return "connected";
  if (tile.connected) return "attention";
  return "available";
}

function matchesStatus(state: ConnectionState, status: StatusFilter): boolean {
  if (status === "all") return true;
  if (status === "available") return state === "available" || state === "soon";
  return state === status;
}

function matchesQuery(item: Searchable, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [item.name, item.description, item.group].some((text) => text.toLowerCase().includes(needle));
}

function matchesCategory(item: Searchable, category: string): boolean {
  return category === ALL_CATEGORIES || item.group === category;
}

export function matchesFilter(item: Searchable, filter: ConnectionFilter): boolean {
  return (
    matchesStatus(item.state, filter.status) &&
    matchesCategory(item, filter.category) &&
    matchesQuery(item, filter.query)
  );
}

export function isFiltered(filter: ConnectionFilter): boolean {
  return filter.status !== "all" || filter.category !== ALL_CATEGORIES || filter.query.trim() !== "";
}

export function categoryOptions(items: Searchable[]): string[] {
  return [...new Set(items.map((item) => item.group))];
}

export function countByStatus(items: Searchable[], filter: ConnectionFilter): Record<StatusFilter, number> {
  const visible = items.filter((item) => matchesCategory(item, filter.category) && matchesQuery(item, filter.query));
  return {
    all: visible.length,
    connected: visible.filter((item) => item.state === "connected").length,
    attention: visible.filter((item) => item.state === "attention").length,
    available: visible.filter((item) => item.state === "available" || item.state === "soon").length,
  };
}
