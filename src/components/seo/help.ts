import {
  ListChecks, Tags, FileText, Wrench, Link2, Braces, Layers, Search, Swords,
  Lightbulb, History,
} from "lucide-react";
import type { TFunction } from "i18next";
import type { HelpSection } from "../HelpDrawer";

/**
 * In-app help for the SEO report, one section per tab.
 *
 * The `id`s match the tab values in the SEO page, so opening the drawer from a
 * tab's help icon can select that tab's section by passing the same id.
 *
 * Only the structure lives here; the strings come from the `help.seo`
 * namespace so the drawer follows the chosen language. Keys are
 * `<tab>Label` / `<tab>Blurb`, plus `<tab><Item>T` / `…D` per item — and
 * `<tab><Item>Tag` for the few items that carry a badge, which is content
 * ("critical", "30-60") rather than markup and so is translated too.
 */

/** A stem suffixed with `*` also resolves a `…Tag` badge. */
const SPEC = [
  { id: "overview", icon: ListChecks, items: ["Score", "Categories", "Severity", "Cluster", "Trend"] },
  { id: "meta", icon: Tags, items: ["Preview", "Title*", "Description*", "Canonical", "Social"] },
  { id: "content", icon: FileText, items: ["Words", "H1*", "Readability", "Quality", "Keywords"] },
  { id: "technical", icon: Wrench, items: ["Checks", "Response", "CrawlerFiles", "Vitals"] },
  { id: "links", icon: Link2, items: ["Broken*", "Redirects", "Errors", "Scope"] },
  { id: "schema", icon: Braces, items: ["Blocks", "Errors*", "Recommended"] },
  { id: "crawl", icon: Layers, items: ["Pages", "Depth", "Issues"] },
  { id: "search", icon: Search, items: ["Clicks", "Queries", "Position"] },
  { id: "compare", icon: Swords, items: ["Add", "SideBySide", "Refresh"] },
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
