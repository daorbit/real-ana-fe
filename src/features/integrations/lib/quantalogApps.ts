import type { WorkspaceAppId } from "@/shared/types";
import type { EnabledApps } from "@/features/workspace/useWorkspaceApps";
import type { IntegrationTile } from "../types";

export interface WorkspaceAppInfo {
  id: WorkspaceAppId;
  tileId: string;
  name: string;
  navLabel: string;
  route: string;
  tagline: string;
  description: string;
  features: { title: string; body: string }[];
}

export const WORKSPACE_APP_INFO: Record<WorkspaceAppId, WorkspaceAppInfo> = {
  compare: {
    id: "compare",
    tileId: "quantalog-compare",
    name: "Quantalog Compare",
    navLabel: "Compare",
    route: "/app/compare",
    tagline: "See how your pages stack up against your competitors'.",
    description: "Track up to 10 competitor pages per site, score them against yours, and get a ranked list of what would close the gap.",
    features: [
      { title: "Head-to-head scores", body: "Your page and each competitor's, measured the same way on content, speed and SEO basics." },
      { title: "Standings and trend", body: "Where you rank in your set today, and how every score has moved over time." },
      { title: "What to fix first", body: "The gaps that matter most, with an AI brief and Orbit ready to explain them." },
    ],
  },
};

export const WORKSPACE_APP_IDS = Object.keys(WORKSPACE_APP_INFO) as WorkspaceAppId[];

export function quantalogAppTile(info: WorkspaceAppInfo, enabled: boolean): IntegrationTile {
  return {
    kind: "quantalog-app",
    id: info.tileId,
    name: info.name,
    category: "quantalog",
    description: info.tagline,
    connected: enabled,
    enabled,
    account: enabled ? `In the sidebar as ${info.navLabel}` : undefined,
  };
}

export function quantalogAppTiles(apps: EnabledApps): { info: WorkspaceAppInfo; tile: IntegrationTile }[] {
  return WORKSPACE_APP_IDS.map((id) => ({ info: WORKSPACE_APP_INFO[id], tile: quantalogAppTile(WORKSPACE_APP_INFO[id], apps[id]) }));
}
