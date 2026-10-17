import type { WorkspaceAppId } from "@/shared/types";
import type { EnabledApps } from "@/features/workspace/useWorkspaceApps";
import type { IntegrationTile } from "../types";

export interface WorkspaceAppInfo {
  id: WorkspaceAppId;
  tileId: string;
  name: string;
  navLabel: string;
  route?: string;
  location: string;
  offNote: string;
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
    location: "in the sidebar",
    offNote: "Your tracked competitors and their history are kept, so turning it back on picks up where you left off.",
    tagline: "See how your pages stack up against your competitors'.",
    description: "Track up to 10 competitor pages per site, score them against yours, and get a ranked list of what would close the gap.",
    features: [
      { title: "Head-to-head scores", body: "Your page and each competitor's, measured the same way on content, speed and SEO basics." },
      { title: "Standings and trend", body: "Where you rank in your set today, and how every score has moved over time." },
      { title: "What to fix first", body: "The gaps that matter most, with an AI brief and Orbit ready to explain them." },
    ],
  },
  goals: {
    id: "goals",
    tileId: "quantalog-goals",
    name: "Quantalog Goals",
    navLabel: "Goals",
    route: "/app/goals",
    location: "in the sidebar",
    offNote: "Your goals and their progress are kept, so turning it back on picks up where you left off.",
    tagline: "Set monthly and quarterly targets that track themselves.",
    description: "Pick a number that matters, such as visitors, form submissions or your Google position, set a target for the month or quarter, and watch progress fill in from your live data.",
    features: [
      { title: "Targets that track themselves", body: "Progress updates from your analytics every minute. Nothing to enter by hand." },
      { title: "On pace or behind", body: "Each goal shows whether you are ahead of where you should be today, not only the total so far." },
      { title: "On your Home screen", body: "Add the Goal progress widget to keep every target in view next to your traffic." },
    ],
  },
  notes: {
    id: "notes",
    tileId: "quantalog-notes",
    name: "Quantalog Notes",
    navLabel: "Notes",
    location: "in your account menu, or by pressing N",
    offNote: "Everyone's notes are kept, so turning it back on brings them all back.",
    tagline: "Private notes that float over any page while you work.",
    description: "Jot down ideas, to-dos and findings without leaving the page you are on. Each person's notes are their own, pinned to the top when they matter and searchable from anywhere.",
    features: [
      { title: "Open anywhere", body: "Press N on any page, or pick Notes from your account menu. The panel floats over your work and can be dragged aside." },
      { title: "Yours alone", body: "Notes belong to you. Teammates never see them, and they follow you across workspaces." },
      { title: "Find them fast", body: "Pin the important ones, and search every note from the command palette with Ctrl K." },
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
    account: enabled ? `${info.navLabel}, ${info.location}` : undefined,
  };
}

export function quantalogAppTiles(apps: EnabledApps): { info: WorkspaceAppInfo; tile: IntegrationTile }[] {
  return WORKSPACE_APP_IDS.map((id) => ({ info: WORKSPACE_APP_INFO[id], tile: quantalogAppTile(WORKSPACE_APP_INFO[id], apps[id]) }));
}
