import type { SharePanels } from "@/shared/types";

type PanelDef = { key: keyof SharePanels };

export const PANEL_GROUPS: { headingKey: string; noteKey?: string; panels: PanelDef[] }[] = [
  {
    headingKey: "share.group.overview",
    panels: [{ key: "totals" }, { key: "trend" }, { key: "engagement" }, { key: "visitorSplit" }],
  },
  {
    headingKey: "share.group.content",
    noteKey: "share.group.contentNote",
    panels: [{ key: "pages" }, { key: "entryPages" }, { key: "exitPages" }],
  },
  {
    headingKey: "share.group.acquisition",
    panels: [{ key: "sources" }, { key: "channels" }],
  },
  {
    headingKey: "share.group.audience",
    panels: [
      { key: "countries" }, { key: "languages" }, { key: "devices" },
      { key: "browsers" }, { key: "operatingSystems" },
    ],
  },
];

export const ALL_PANELS = PANEL_GROUPS.flatMap((g) => g.panels);

export const DEFAULT_PANELS: SharePanels = {
  totals: true, trend: true, pages: true, sources: true, countries: true, devices: true,
  browsers: false, operatingSystems: false, entryPages: false, exitPages: false,
  languages: false, channels: false, engagement: false, visitorSplit: false,
};
