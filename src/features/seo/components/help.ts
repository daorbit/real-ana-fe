import {
  ListChecks, Tags, FileText, Wrench, Link2, Braces, Layers, Search,
  Lightbulb, History, Bot, AlertTriangle, Gauge, Image as ImageIcon,
} from "lucide-react";
import type { TFunction } from "i18next";
import type { HelpSection } from "@/shared/ui/HelpDrawer";


const SPEC = [
  { id: "overview", icon: ListChecks, items: ["Score", "Categories", "Severity", "Cluster", "Trend"] },
  { id: "issues", icon: AlertTriangle, items: ["List", "Severity", "Area", "Filter"] },
  { id: "meta", icon: Tags, items: ["Preview", "Title*", "Description*", "Canonical", "Social"] },
  { id: "content", icon: FileText, items: ["Words", "H1*", "Readability", "Quality", "Keywords"] },
  { id: "images", icon: ImageIcon, items: ["Alt*", "Dimensions", "Loading"] },
  { id: "schema", icon: Braces, items: ["Blocks", "Errors*", "Recommended"] },
  { id: "technical", icon: Wrench, items: ["Checks", "Response", "CrawlerFiles"] },
  { id: "performance", icon: Gauge, items: ["Crux*", "Vitals", "Lab", "Composition"] },
  { id: "links", icon: Link2, items: ["Broken*", "Redirects", "Errors", "Scope"] },
  { id: "crawl", icon: Layers, items: ["Pages", "Depth", "Issues"] },
  { id: "ai", icon: Bot, items: ["Access*", "Training", "Readiness", "LlmsTxt"] },
  { id: "search", icon: Search, items: ["Clicks", "Queries", "Position"] },
  { id: "suggestions", icon: Lightbulb, items: ["Sorted", "Advice", "Saving"] },
  { id: "history", icon: History, items: ["Change", "Open", "Best"] },
] as const;

/** Resolve the SEO report help into translated sections. */
export function getSeoHelp(t: TFunction): HelpSection[] {
  return SPEC.map((s) => ({
    id: s.id,
    icon: s.icon,
    label: t(`help.seo.${s.id}Label`),
    blurb: t(`help.seo.${s.id}Blurb`),
    items: s.items.map((raw) => {
      const tagged = raw.endsWith("*");
      const stem = tagged ? raw.slice(0, -1) : raw;
      return {
        term: t(`help.seo.${s.id}${stem}T`),
        detail: t(`help.seo.${s.id}${stem}D`),
        ...(tagged ? { tag: t(`help.seo.${s.id}${stem}Tag`) } : {}),
      };
    }),
  }));
}
