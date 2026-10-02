import { LayoutGrid, Orbit } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WIDGET_GROUPS, WIDGET_MAP, isSearchWidget } from "@/features/analytics/widgetCatalog";
import type { Placed } from "@/features/analytics/widgetCatalog";
import type { DashboardRange } from "@/features/dashboards/types";
import { TEMPLATE_LIBRARY } from "@/features/dashboards/templateData";

export type TemplateAccent = "emerald" | "amber" | "cyan" | "pink" | "violet" | "blue" | "orange" | "teal";

export type TemplateCategory = "Business" | "Marketing" | "Search" | "Content" | "Product";

export type WidgetGroup = (typeof WIDGET_GROUPS)[number];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = ["Business", "Marketing", "Search", "Content", "Product"];

export type DashboardTemplate = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: TemplateAccent;
  category: TemplateCategory | null;
  range: DashboardRange;
  layout: Placed[];
};

export const BLANK_TEMPLATE: DashboardTemplate = {
  id: "blank",
  name: "Blank",
  tagline: "Start from an empty canvas",
  description: "Pick every widget yourself and arrange them however you like.",
  icon: LayoutGrid,
  accent: "emerald",
  category: null,
  range: "7d",
  layout: [],
};

export const TEMPLATES: DashboardTemplate[] = TEMPLATE_LIBRARY;

export const CATEGORY_DESCRIPTIONS: Record<TemplateCategory, string> = {
  Business: "For owners, leadership and client reporting",
  Marketing: "Campaigns, channels and lead flow",
  Search: "Google rankings, queries and SEO health",
  Content: "Reading, ranking and organic reach",
  Product: "Engagement, reliability and live usage",
};

export const CATEGORY_ACCENT: Record<TemplateCategory, TemplateAccent> = {
  Business: "violet",
  Marketing: "orange",
  Search: "emerald",
  Content: "blue",
  Product: "cyan",
};

export function layoutGroups(layout: Placed[]): { group: WidgetGroup; ids: string[] }[] {
  return WIDGET_GROUPS.map((group) => ({
    group,
    ids: layout.filter((p) => WIDGET_MAP[p.id]?.group === group).map((p) => p.id),
  })).filter((g) => g.ids.length > 0);
}

export function usesSearch(layout: Placed[]): boolean {
  return layout.some((p) => isSearchWidget(p.id));
}

export function matchesTemplate(t: DashboardTemplate, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [t.name, t.tagline, t.description, t.category ?? ""].some((s) => s.toLowerCase().includes(q));
}

export const ORBIT_TEMPLATE: DashboardTemplate = {
  id: "orbit",
  name: "Built with Orbit",
  tagline: "Designed by Orbit AI from your description",
  description: "A layout Orbit put together from what you asked for.",
  icon: Orbit,
  accent: "emerald",
  category: null,
  range: "7d",
  layout: [],
};

export const ALL_TEMPLATES: DashboardTemplate[] = [BLANK_TEMPLATE, ...TEMPLATES];

export const TEMPLATE_MAP = Object.fromEntries(
  [...ALL_TEMPLATES, ORBIT_TEMPLATE].map((t) => [t.id, t])
) as Record<string, DashboardTemplate>;
