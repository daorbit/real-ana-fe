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
  publicDashboard: {
    id: "publicDashboard",
    tileId: "quantalog-public-dashboard",
    name: "Quantalog Public Dashboard",
    navLabel: "Public dashboard",
    location: "right here in Apps",
    offNote: "Your link and its settings are kept, but the link stops working until you turn it back on.",
    tagline: "Share a live, read-only analytics dashboard at a link anyone can open.",
    description: "Give clients, investors or your whole team your numbers without giving them an account. You pick exactly which panels the public page shows.",
    features: [
      { title: "One link, live numbers", body: "Visitors, pages, sources and countries update in real time. No login needed to view." },
      { title: "You choose what is public", body: "Turn each of 14 panels on or off. Anything off never leaves the server." },
      { title: "Post it anywhere", body: "Share to LinkedIn or X with a preview card, and see how often the link is opened." },
    ],
  },
  seoReports: {
    id: "seoReports",
    tileId: "quantalog-seo-reports",
    name: "Quantalog SEO Reports",
    navLabel: "SEO reports",
    location: "right here in Apps",
    offNote: "Your report links and their settings are kept, but the links stop working until you turn it back on.",
    tagline: "Send a client a public link to any SEO audit.",
    description: "Turn an SEO audit into a clean, read-only report at its own link. Choose which sections a client sees, and replace the link at any time.",
    features: [
      { title: "A link per audit", body: "Every audited page gets its own report link, ready to send to a client or a teammate." },
      { title: "Only what you choose", body: "Show the score and issues, and keep internal URLs, links and raw data private." },
      { title: "Know it was read", body: "See how often each report was opened, and replace a link the moment it leaks." },
    ],
  },
  bio: {
    id: "bio",
    tileId: "quantalog-bio",
    name: "Quantalog Link-in-bio",
    navLabel: "Link in bio",
    route: "/app/bio",
    location: "in the sidebar",
    offNote: "Your pages and their stats are kept, but the public links stop working until you turn it back on.",
    tagline: "One link for your Instagram, LinkedIn and TikTok bio, with every click counted.",
    description: "Build a clean page of your most important links, put its address in your social bios, and see which links people actually tap. No extra tracking code needed.",
    features: [
      { title: "Ready in a minute", body: "Add a photo, a short bio, your links and social icons. The preview shows exactly what visitors see." },
      { title: "Every tap counted", body: "Views and clicks per link for the last 30 days, so you know what your audience wants." },
      { title: "Yours to style", body: "Light or dark, your accent colour and button shape, on a fast page at your own address." },
    ],
  },
  funnels: {
    id: "funnels",
    tileId: "quantalog-funnels",
    name: "Quantalog Funnels",
    navLabel: "Funnels",
    route: "/app/funnels",
    location: "in the sidebar",
    offNote: "Your saved funnels are kept, so turning it back on picks up where you left off.",
    tagline: "See exactly where visitors drop off on the way to signing up or buying.",
    description: "Chain the pages and events that lead to a sale or signup, and see how many visitors make it through each step, where they leave, and how many you lose.",
    features: [
      { title: "Pages and events together", body: "Mix pages like /pricing with events like checkout_started, up to eight steps in order." },
      { title: "The leak, named", body: "Every step shows who reached it and who left, and the biggest drop is called out for you." },
      { title: "Saved for the team", body: "Save a funnel once and anyone in the workspace can open it for any date range." },
    ],
  },
  invoicing: {
    id: "invoicing",
    tileId: "quantalog-invoicing",
    name: "Quantalog Invoicing",
    navLabel: "Invoices",
    route: "/app/invoices",
    location: "in the sidebar",
    offNote: "Your invoices, quotations and business details are kept, so turning it back on picks up where you left off.",
    tagline: "Send quotations and invoices to your leads without leaving Quantalog.",
    description: "Create quotations and invoices with your business details filled in, turn an accepted quote into an invoice in one click, and see what has been paid and what is still due.",
    features: [
      { title: "Your details, every time", body: "Add your business name, address and GSTIN once. Every new quote and invoice starts with them." },
      { title: "Quote to invoice", body: "Convert an accepted quotation into a numbered invoice in one click, nothing typed twice." },
      { title: "Paid and pending", body: "See revenue, unpaid invoices and open quotes for the workspace at a glance." },
    ],
  },
  tasks: {
    id: "tasks",
    tileId: "quantalog-tasks",
    name: "Quantalog Tasks",
    navLabel: "Tasks",
    route: "/app/tasks",
    location: "in the sidebar",
    offNote: "Your tasks are kept, so turning it back on picks up where you left off.",
    tagline: "Plan the team's work on one board: who does what, by when.",
    description: "A planner board for the workspace. Add tasks, give them owners, labels, checklists and due dates, and drag them from Not started to Completed. Group the board by progress, person or priority.",
    features: [
      { title: "A real planner board", body: "Drag cards between columns, group by progress, person or priority, or switch to a grid of every task." },
      { title: "Clear owners", body: "Assign a task to anyone in the workspace. They hear about it in the bell straight away." },
      { title: "Details that matter", body: "Labels, checklists you can show on the card, priorities and due dates that turn red when late." },
    ],
  },
  insights: {
    id: "insights",
    tileId: "quantalog-insights",
    name: "Quantalog Insights",
    navLabel: "Insights",
    route: "/app/insights",
    location: "in the sidebar",
    offNote: "Past weeks' insights are kept, so turning it back on picks up where you left off.",
    tagline: "What changed on your site this week, and why it matters.",
    description: "Every Monday, Insights compares the week with the one before and calls out what moved: new traffic sources, pages taking off or slipping, new countries and changes in how people browse, with a short summary from Orbit.",
    features: [
      { title: "Changes, not charts", body: "Only what actually moved, ranked by how much it matters, in plain sentences." },
      { title: "The why behind it", body: "Each insight shows this week against last, with Orbit's two-line read on the week." },
      { title: "From insight to action", body: "Open the matching analytics view, or turn any insight into a task in one click." },
    ],
  },
};

export const WORKSPACE_APP_IDS = Object.keys(WORKSPACE_APP_INFO) as WorkspaceAppId[];

const APP_AVAILABLE: Partial<Record<WorkspaceAppId, boolean>> = {
  invoicing: Boolean(import.meta.env.VITE_INVOICES_URL),
};

function appAvailable(id: WorkspaceAppId): boolean {
  return APP_AVAILABLE[id] ?? true;
}

export function quantalogAppTile(info: WorkspaceAppInfo, enabled: boolean, price?: string): IntegrationTile {
  return {
    kind: "quantalog-app",
    id: info.tileId,
    name: info.name,
    category: "quantalog",
    description: info.tagline,
    connected: enabled,
    enabled,
    account: enabled ? `${info.navLabel}, ${info.location}` : undefined,
    price: enabled ? undefined : price,
  };
}

export function quantalogAppTiles(
  apps: EnabledApps,
  prices: Partial<Record<WorkspaceAppId, string>> = {},
): { info: WorkspaceAppInfo; tile: IntegrationTile }[] {
  return WORKSPACE_APP_IDS.filter(appAvailable).map((id) => ({
    info: WORKSPACE_APP_INFO[id],
    tile: quantalogAppTile(WORKSPACE_APP_INFO[id], apps[id], prices[id]),
  }));
}
