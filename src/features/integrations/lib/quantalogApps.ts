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
  reviews: {
    id: "reviews",
    tileId: "quantalog-reviews",
    name: "Quantalog Reviews",
    navLabel: "Reviews",
    route: "/app/reviews",
    location: "in the sidebar",
    offNote: "Your Google connection and synced reviews are kept, so turning it back on picks up where you left off.",
    tagline: "Your Google reviews, synced into Quantalog.",
    description: "Connect your Google Business Profile to see every review and your rating breakdown in one place, and serve them on your website through the Quantalog API.",
    features: [
      { title: "Every review in one place", body: "Ratings, comments and your replies for each business location, kept in sync automatically." },
      { title: "Rating breakdown", body: "See how your stars split from five to one, and spot a dip before it shows on Google." },
      { title: "On your website", body: "Show your best reviews on your own site through the Quantalog API." },
    ],
  },
  links: {
    id: "links",
    tileId: "quantalog-links",
    name: "Quantalog Links",
    navLabel: "Links",
    location: "at the top of the sidebar",
    offNote: "Your links are kept, so turning it back on puts them back in the sidebar.",
    tagline: "Shortcuts to your team's other tools, right in the sidebar.",
    description: "Add Stripe, Notion, your CRM or any tool your team opens daily to the sidebar. Open them in a new tab, or inside Quantalog without leaving the app.",
    features: [
      { title: "One click away", body: "Up to 10 tools your team uses most, listed under Links at the top of everyone's sidebar." },
      { title: "Open inside Quantalog", body: "Choose to open a link in a new tab or in a page inside Quantalog, so work stays in one window." },
      { title: "Your logos", body: "Each link shows its site's icon automatically, or a logo you upload." },
    ],
  },
  media: {
    id: "media",
    tileId: "quantalog-media",
    name: "Quantalog Media",
    navLabel: "Media",
    route: "/app/media",
    location: "in the sidebar",
    offNote: "Your files are kept, and posts, branding and forms keep using them while it is off.",
    tagline: "One library for your workspace's images, videos and files.",
    description: "Upload once and reuse everywhere: post images, your logo, form backgrounds and payment windows all pick from the same library. Search, filter, rename and clean up in one place.",
    features: [
      { title: "Upload once, use anywhere", body: "Scheduled posts, branding and forms all pick from the same library, so nothing is uploaded twice." },
      { title: "Find files fast", body: "Search by name and filter by images, videos or other files." },
      { title: "Keep it tidy", body: "Rename files, preview them full size, and delete what you no longer need in bulk." },
    ],
  },
  alerts: {
    id: "alerts",
    tileId: "quantalog-alerts",
    name: "Quantalog Alerts",
    navLabel: "Alerts",
    route: "/app/alerts",
    location: "in the sidebar",
    offNote: "Your alert settings and history are kept, so turning it back on picks up where you left off.",
    tagline: "Hear about traffic drops, spikes and stalled goals as they happen.",
    description: "Quantalog watches your sites around the clock and tells you when traffic falls or jumps, tracking stops, a goal slips behind pace or your forms go quiet, by email, Telegram, WhatsApp or the bell.",
    features: [
      { title: "Catch problems early", body: "A sudden drop or a site that stopped sending data reaches you in hours, not at the end of the month." },
      { title: "Once per incident", body: "Each alert fires when something starts and stays quiet until it clears, so your inbox does not fill up." },
      { title: "Where you already are", body: "Choose email, Telegram, WhatsApp or the in-app bell, and tune every threshold." },
    ],
  },
  popups: {
    id: "popups",
    tileId: "quantalog-popups",
    name: "Quantalog Popups",
    navLabel: "Popups",
    route: "/app/popups",
    location: "in the sidebar",
    offNote: "Your popups are kept but stop showing on your sites until you turn it back on.",
    tagline: "Show your lead capture forms as popups on your website.",
    description: "Turn any lead capture form into a popup or slide-in on your site, timed to a delay, a scroll depth or the moment someone is about to leave. It runs through the tracking script you already installed.",
    features: [
      { title: "No new code", body: "Popups load through your existing Quantalog script, after the page has finished loading." },
      { title: "The right moment", body: "Open after a few seconds, halfway down the page, or when a visitor heads for the close button." },
      { title: "Never annoying", body: "Pick the pages and devices, and how long to wait before showing it to the same person again." },
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
