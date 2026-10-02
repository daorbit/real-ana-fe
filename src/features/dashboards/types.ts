import type { Placed, WidgetId } from "@/features/analytics/widgetCatalog";
import type { Stats } from "@/shared/types";

export type DashboardRange = "24h" | "7d" | "30d";

export type Dashboard = {
  id: string;
  name: string;
  description: string;
  template: string;
  range: DashboardRange;
  layout: Placed[];
  createdAt: string;
  updatedAt: string;
};

export type DashboardInput = {
  name?: string;
  description?: string;
  template?: string;
  range?: DashboardRange;
  layout?: Placed[];
};

export type DashboardDraft = {
  name: string;
  description: string;
  range: DashboardRange;
  layout: Placed[];
};

export type DashboardOrbitMode = "create" | "edit";

export type DashboardOrbitRequest = {
  workspaceId: string;
  prompt: string;
  mode: DashboardOrbitMode;
  current?: DashboardDraft;
  history?: { role: "user" | "assistant"; content: string }[];
};

export type DashboardOrbitReply = {
  reply: string;
  draft: DashboardDraft;
  suggestions: string[];
};

export type EmbedTheme = "auto" | "light" | "dark";

export type Embed = {
  id: string;
  name: string;
  widget: WidgetId;
  range: DashboardRange;
  theme: EmbedTheme;
  sites: string[];
  token: string;
  enabled: boolean;
  views: number;
  lastViewedAt: string | null;
  createdAt: string;
};

export type EmbedInput = {
  name?: string;
  widget?: WidgetId;
  range?: DashboardRange;
  theme?: EmbedTheme;
  sites?: string[];
  enabled?: boolean;
};

export type PublicEmbed = {
  name: string;
  widget: WidgetId;
  range: DashboardRange;
  theme: EmbedTheme;
  workspace: string;
  data: Partial<Stats>;
};

export const DASHBOARD_RANGES: { value: DashboardRange; label: string; long: string }[] = [
  { value: "24h", label: "24h", long: "last 24 hours" },
  { value: "7d", label: "7d", long: "last 7 days" },
  { value: "30d", label: "30d", long: "last 30 days" },
];

export function rangeLong(range: DashboardRange): string {
  return DASHBOARD_RANGES.find((r) => r.value === range)?.long ?? range;
}
