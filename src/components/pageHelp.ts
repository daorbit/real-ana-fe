import {
  CalendarClock, Mail, FileSpreadsheet, Send,
  CreditCard, Layers, ShoppingCart, Receipt,
  KeyRound, BookOpen, ShieldCheck,
  Share2, BarChart3, Search, EyeOff,
  FolderKanban, Globe, Code2,
} from "lucide-react";
import type { HelpSection } from "./HelpDrawer";

/**
 * In-app help for the pages that aren't Analytics or SEO.
 *
 * Those two pages own their help content because it is large and tracks their
 * own tab lists (`analyticsHelp.ts`, `seo/help.ts`). Everything else is a
 * handful of sections each, so it lives here in one map keyed by route and is
 * rendered by the shell's help button — a page opts in by having an entry,
 * not by wiring a drawer of its own.
 *
 * Keep an entry in step with the page it describes: the drawer should never
 * explain a control that isn't on screen.
 */

const REPORTS_HELP: HelpSection[] = [
  {
    id: "schedules",
    label: "Schedules",
    icon: CalendarClock,
    blurb:
      "A report is a saved schedule: which sites, how often, and who it goes to. It keeps sending until you pause or delete it.",
    items: [
      { term: "Active reports", detail: "How many schedules are currently sending. Pausing a report keeps its configuration and recipients — it simply stops delivering until you switch it back on." },
      { term: "Next delivery", detail: "When the soonest report goes out, and which one it is. Sends are queued in the workspace's timezone, so a change to the schedule takes effect from the next run onward." },
      { term: "Frequency", detail: "Daily, weekly or monthly. The period covered always matches the frequency, and each email compares it against the previous period of the same length." },
      { term: "Sites", detail: "A report can cover one site or several. With more than one, the email carries a section per site rather than blending their numbers together." },
    ],
  },
  {
    id: "recipients",
    label: "Recipients",
    icon: Mail,
    blurb:
      "Reports usually go to people outside the account — a client, a manager — so addresses are listed in full rather than counted.",
    items: [
      { term: "People reached", detail: "Unique addresses across all active reports. Someone on two reports counts once here but still receives both emails." },
      { term: "No account needed", detail: "Recipients don't sign up for anything. They receive the email and can act on it without ever opening the dashboard." },
      { term: "Unsubscribed", detail: "Anyone who opts out stays visible on the card, greyed out, instead of quietly disappearing — so a report that looks like it's reaching five people isn't silently reaching three." },
      { term: "Test send", detail: "Sends the report exactly as scheduled, immediately, to you only. Use it to check the content before real recipients ever see it." },
    ],
  },
  {
    id: "contents",
    label: "What's in the email",
    icon: FileSpreadsheet,
    blurb:
      "Headline numbers in the body, the full breakdown attached, and optionally a link to the live dashboard.",
    items: [
      { term: "Traffic & SEO summary", detail: "Visitors, pageviews, sessions and SEO score for the period, each with its change against the previous one." },
      { term: "Spreadsheet attachment", detail: "Every breakdown — pages, sources, geography, devices — on its own sheet, so a recipient can pivot the raw numbers themselves." },
      { term: "Live dashboard link", detail: "Optional. Including it publishes the workspace's public dashboard: anyone holding the link can open it, forwarded email included. Leave it off if the recipient list isn't trusted." },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: Send,
    blurb:
      "How the mail actually leaves, and what to check when it doesn't arrive.",
    items: [
      { term: "Outbound email not configured", detail: "When this deployment has no mail credentials, schedules still save but nothing is delivered. They begin sending as soon as mail is configured — no need to recreate them." },
      { term: "WhatsApp delivery", detail: "Available on plans that include it. It sends a short summary to the owner's verified mobile number alongside the email, not instead of it." },
      { term: "Spam folder", detail: "First delivery to a new domain often lands in spam. Ask recipients to mark it as not-spam once; later sends then arrive normally." },
    ],
  },
];

const BILLING_HELP: HelpSection[] = [
  {
    id: "usage",
    label: "Plan & usage",
    icon: CreditCard,
    blurb:
      "What you're on now, how much of this cycle's quota is left, and when it resets.",
    items: [
      { term: "Cycle", detail: "The billing period your plan runs on — monthly or yearly. Quotas are monthly either way; a yearly plan is a discount on price, not a bigger single pool." },
      { term: "Audits / crawls used", detail: "How much of this month's quota you've spent. Both reset at the start of each monthly period, whatever your billing cycle." },
      { term: "Expired", detail: "The period ended without renewal. Existing data stays readable, but new audits and crawls are paused until you renew." },
      { term: "Renewal date", detail: "When the next period begins and quotas reset. Purchases don't auto-renew — a plan is a one-time charge for one month or one year." },
    ],
  },
  {
    id: "plans",
    label: "Plans",
    icon: Layers,
    blurb:
      "The plan grid. Each card lists its monthly audit and crawl quota alongside the features it unlocks.",
    items: [
      { term: "Current plan", detail: "The plan backing your account right now. Its card is marked rather than buyable, and a lower tier is shown as a downgrade." },
      { term: "Upgrade", detail: "Takes effect immediately. The new quota is available as soon as payment clears, without waiting for the current period to end." },
      { term: "Monthly vs. yearly", detail: "The toggle above the grid reprices every card. Yearly is charged once for twelve months at a lower effective rate." },
      { term: "Currency", detail: "Prices display in your local currency where supported. The charge itself is made in the currency shown at checkout." },
    ],
  },
  {
    id: "addons",
    label: "Add-ons",
    icon: ShoppingCart,
    blurb:
      "Extra audits or crawls for when you outgrow the monthly quota without wanting a bigger plan.",
    items: [
      { term: "Credits never expire", detail: "Unlike plan quota, bought credits carry across periods. They sit alongside the plan allowance rather than replacing it." },
      { term: "Plan quota is spent first", detail: "Credits are only drawn on once the month's plan allowance is exhausted, so nothing bought is wasted at a reset." },
      { term: "Remaining balance", detail: "The counters separate \"from plan\" and \"bought\" deliberately — they behave differently at the end of a period, and a single total would hide that." },
    ],
  },
  {
    id: "history",
    label: "Payment history",
    icon: Receipt,
    blurb:
      "Every charge on the account, newest first, with an invoice for each.",
    items: [
      { term: "Invoice", detail: "A downloadable record of one payment — plan or add-on — with the amount, currency, date and payment reference." },
      { term: "Failed payments", detail: "A failed charge is listed too, so an unexpectedly unchanged plan has a visible explanation rather than none." },
      { term: "Refunds", detail: "Refunds appear as their own entry against the original charge rather than removing it, keeping the history an accurate ledger." },
    ],
  },
];

const DEVELOPERS_HELP: HelpSection[] = [
  {
    id: "keys",
    label: "API keys",
    icon: KeyRound,
    blurb:
      "Server-side secrets scoped to this workspace. They authenticate the Platform API — creating projects and sites for your own users from your backend.",
    items: [
      { term: "Workspace-scoped", detail: "A key only reaches the workspace it was created in. Switching workspace in the rail shows that workspace's keys, not a global list." },
      { term: "Key name", detail: "A label so you can tell keys apart — \"Production backend\", \"Staging\". Only you see it; it carries no permissions of its own." },
      { term: "Prefix", detail: "The visible first characters of a key, shown in the list. Enough to match a key against your environment variables without revealing the secret." },
      { term: "Last used", detail: "When the key last authenticated a request. \"Never used\" on a key you deployed days ago usually means the integration isn't sending it." },
    ],
  },
  {
    id: "security",
    label: "Handling secrets",
    icon: ShieldCheck,
    blurb:
      "A key is a password for your workspace's data. Treat it like one.",
    items: [
      { term: "Shown once", detail: "The full secret appears only in the dialog that creates it. Only a hash is stored, so it genuinely cannot be recovered later — copy it before closing." },
      { term: "Server-side only", detail: "Never put a key in browser code, a mobile app, or a public repository. Anything shipped to a client is readable by anyone who receives it. Use an environment variable on your server." },
      { term: "Revoking", detail: "Revocation is immediate and permanent. Any integration still sending the key starts receiving 401 Unauthorized, so roll a replacement in first if the caller must stay up." },
      { term: "If a key leaks", detail: "Revoke it and create a new one. There is no way to restrict a leaked key to fewer permissions — replacement is the only fix." },
    ],
  },
  {
    id: "docs",
    label: "Documentation",
    icon: BookOpen,
    blurb:
      "The tracking snippet, custom events and the full Platform API reference live on the docs site.",
    items: [
      { term: "Install guide", detail: "The one-line snippet that starts collecting pageviews, plus framework notes for single-page apps where route changes need to be reported explicitly." },
      { term: "Custom events", detail: "rta.track() sends your own named events, optionally with a revenue value, which then appear on the Analytics page's Events and Goals tabs." },
      { term: "Platform API", detail: "The endpoints an API key unlocks — creating workspaces and sites, and reading stats — for embedding analytics in your own product." },
    ],
  },
];

const SHARE_HELP: HelpSection[] = [
  {
    id: "link",
    label: "Public link",
    icon: Share2,
    blurb:
      "One read-only link to this workspace's dashboard. Anyone holding it can open it — there is no sign-in and no per-person access.",
    items: [
      { term: "Public dashboard toggle", detail: "Off means the link returns nothing. Switching it on publishes immediately, so treat turning it on as the moment the data becomes public." },
      { term: "The link is the credential", detail: "Whoever has the URL has access, including anyone it gets forwarded to. Share it the way you'd share a password." },
      { term: "Replace link", detail: "Generates a fresh URL and permanently breaks the old one. This is how you revoke access from someone who already has the link." },
      { term: "Live data", detail: "A public dashboard reflects the same numbers you see, updating as they do. It is not a frozen snapshot of the moment you shared it." },
    ],
  },
  {
    id: "visible",
    label: "What visitors see",
    icon: BarChart3,
    blurb:
      "Panel by panel control over the public view, so a client sees traffic without seeing everything.",
    items: [
      { term: "Panels", detail: "Each panel — headline metrics, pages, sources, geography, technology — is individually switchable. A panel that's off is absent from the public page, not blurred out." },
      { term: "Activity", detail: "The live \"right now\" view. Useful for showing a launch in progress; switch it off if you'd rather not expose current traffic in real time." },
      { term: "Site scope", detail: "The public dashboard covers this workspace. To share a subset, put those sites in a workspace of their own and share that one." },
    ],
  },
  {
    id: "seo",
    label: "Shared audits",
    icon: Search,
    blurb:
      "SEO audits share separately from the analytics dashboard — each audited page gets its own read-only link.",
    items: [
      { term: "Per-audit links", detail: "Turning on sharing for one audit doesn't affect any other, and doesn't publish the analytics dashboard." },
      { term: "What it shows", detail: "The score, the issues found, and the recommendations — the same report you see, minus anything you switch off for it." },
      { term: "Turning it off", detail: "Disabling a shared audit takes its link out of service straight away. Anyone with the URL gets nothing from that point on." },
    ],
  },
  {
    id: "never",
    label: "Never shared",
    icon: EyeOff,
    blurb:
      "Some things are excluded from every public view regardless of the switches above.",
    items: [
      { term: "Account and billing", detail: "Your email, plan, invoices and payment history are never part of a shared page." },
      { term: "Keys and settings", detail: "API keys, workspace settings and site configuration are never exposed. A public viewer cannot change anything." },
      { term: "Other workspaces", detail: "A link reaches exactly one workspace. It reveals no evidence that any other exists." },
    ],
  },
];

const WORKSPACES_HELP: HelpSection[] = [
  {
    id: "workspaces",
    label: "Workspaces",
    icon: FolderKanban,
    blurb:
      "A workspace groups the sites you want to look at together. The rail's switcher decides which one every other page is showing.",
    items: [
      { term: "What belongs together", detail: "One client, one product, one environment — whatever you'd want to see totalled on a single dashboard. Sites in different workspaces are never summed." },
      { term: "The active workspace", detail: "Analytics, SEO, Reports and Developers all read from the workspace selected in the rail. Switching it reloads every panel against the other dataset." },
      { term: "Rename", detail: "The name is a label only. Renaming affects nothing else — no link breaks, no data moves." },
      { term: "Delete", detail: "Permanently removes the workspace and everything in it: sites, collected events, API keys and any public link. This cannot be undone." },
    ],
  },
  {
    id: "sites",
    label: "Sites",
    icon: Globe,
    blurb:
      "A site is one domain being tracked. It's what the tracking snippet reports against.",
    items: [
      { term: "Domain", detail: "Events are accepted for the domain you register. A mismatch between the site here and where the snippet actually runs is the usual reason a new install shows nothing." },
      { term: "Site ID", detail: "The identifier baked into the tracking snippet. Each site has its own, which is what keeps two sites in one workspace separate." },
      { term: "Waiting for data", detail: "A site shows no numbers until its first event arrives. Load a page with the snippet installed and it appears within seconds." },
      { term: "Removing a site", detail: "Deletes the site and its collected events from the workspace. The snippet keeps firing until you also remove it from the page, but the events are discarded." },
    ],
  },
  {
    id: "install",
    label: "Installing the snippet",
    icon: Code2,
    blurb:
      "Tracking starts when the snippet runs on the page. The full guide lives in the docs.",
    items: [
      { term: "Where it goes", detail: "In the page head, on every page you want counted. A snippet only on the homepage measures only the homepage." },
      { term: "Single-page apps", detail: "Client-side route changes aren't page loads. The docs cover reporting them so an SPA doesn't record one pageview per visit." },
      { term: "Blocked by ad blockers", detail: "Some blockers drop third-party analytics. A visit you make yourself not appearing doesn't mean the install is broken — check from another browser before debugging." },
    ],
  },
];

/**
 * Route path to help content and drawer title.
 *
 * Matched exactly against `location.pathname`, matching how the nav rail marks
 * its active item. Analytics and SEO are absent on purpose — they render their
 * own drawer, next to the controls their help describes.
 */
export const PAGE_HELP: Record<string, { title: string; sections: HelpSection[] }> = {
  "/app/reports": { title: "Reports help", sections: REPORTS_HELP },
  "/app/billing": { title: "Billing help", sections: BILLING_HELP },
  "/app/developers": { title: "Developers help", sections: DEVELOPERS_HELP },
  "/app/share": { title: "Public dashboard help", sections: SHARE_HELP },
  "/app/workspaces": { title: "Workspaces help", sections: WORKSPACES_HELP },
};
