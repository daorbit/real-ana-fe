import type { SeoSharePanels } from "@/shared/types";
import type { PanelGroup } from "../PanelSwitchList";

export const SEO_PANEL_GROUPS: PanelGroup<keyof SeoSharePanels>[] = [
  {
    heading: "Summary",
    panels: [
      { key: "summary", label: "Score & Lighthouse", hint: "Overall score and category rings" },
      { key: "issues", label: "Issues", hint: "What the audit flagged" },
      { key: "technical", label: "Technical checks", hint: "HTTPS, viewport, crawler files" },
      { key: "performance", label: "Performance", hint: "Core Web Vitals & opportunities" },
    ],
  },
  {
    heading: "Detail",
    note: "These can carry internal URLs or staging paths. Publish them deliberately.",
    panels: [
      { key: "meta", label: "Meta tags", hint: "Title, description, social tags" },
      { key: "content", label: "Content", hint: "Word count, headings, images" },
      { key: "links", label: "Links", hint: "Full link-check results" },
      { key: "schema", label: "Structured data", hint: "JSON-LD validation" },
      { key: "aiSearch", label: "AI search", hint: "Answer-engine access and readiness" },
    ],
  },
];

export const SEO_ALL_PANELS = SEO_PANEL_GROUPS.flatMap((g) => g.panels);

export const SEO_DEFAULT_PANELS: SeoSharePanels = {
  summary: true, issues: true, technical: true, performance: true,
  meta: false, content: false, links: false, schema: false, aiSearch: false,
};
