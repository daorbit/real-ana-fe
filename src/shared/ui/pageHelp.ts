import {
  CalendarClock, Mail, FileSpreadsheet, Send,
  CreditCard, Layers, ShoppingCart, Receipt,
  KeyRound, BookOpen, ShieldCheck,
  Share2, BarChart3, Search, EyeOff,
  FolderKanban, Globe, Code2,
  LayoutGrid, SlidersHorizontal, Users, UserPlus,
  PenLine, Clock, AlertTriangle, Link2,
} from "lucide-react";
import type { TFunction } from "i18next";
import type { HelpSection } from "@/shared/ui/HelpDrawer";

/**
 * In-app help for the pages that aren't Analytics or SEO.
 *
 * Only the *structure* lives here — which sections a page has, in what order,
 * and the icon for each. Every string is resolved from the `help.<page>`
 * namespace at render, so the drawer follows the chosen language like the rest
 * of the app rather than being an island of hardcoded English.
 *
 * Key convention matches the existing `help.analytics` block: a section
 * contributes `<id>Label` and `<id>Blurb`, and each item contributes
 * `<id><Item>T` (the term) and `<id><Item>D` (the detail).
 *
 * Keep an entry in step with the page it describes: the drawer should never
 * explain a control that isn't on screen.
 */

/** One section's shape: its id, icon, and the item keys it renders, in order. */
type SectionSpec = {
  id: string;
  icon: HelpSection["icon"];
  /** Item key stems — each resolves `<id><stem>T` and `<id><stem>D`. */
  items: string[];
};

const REPORTS_SPEC: SectionSpec[] = [
  { id: "schedules", icon: CalendarClock, items: ["Active", "Next", "Frequency", "Sites"] },
  { id: "recipients", icon: Mail, items: ["Reach", "NoAccount", "Unsub", "Test"] },
  { id: "contents", icon: FileSpreadsheet, items: ["Summary", "Sheet", "LiveLink"] },
  { id: "delivery", icon: Send, items: ["NotConfigured", "WhatsApp", "Spam"] },
];

const BILLING_SPEC: SectionSpec[] = [
  { id: "usage", icon: CreditCard, items: ["Cycle", "Used", "Expired", "Renewal"] },
  { id: "plans", icon: Layers, items: ["Current", "Upgrade", "Cycles", "Currency"] },
  { id: "addons", icon: ShoppingCart, items: ["NoExpiry", "PlanFirst", "Balance"] },
  { id: "history", icon: Receipt, items: ["Invoice", "Failed", "Refund"] },
];

const DEVELOPERS_SPEC: SectionSpec[] = [
  { id: "keys", icon: KeyRound, items: ["Scope", "Name", "Prefix", "LastUsed"] },
  { id: "security", icon: ShieldCheck, items: ["Once", "ServerOnly", "Revoke", "Leak"] },
  { id: "docs", icon: BookOpen, items: ["Install", "Events", "Api"] },
];

const SHARE_SPEC: SectionSpec[] = [
  { id: "link", icon: Share2, items: ["Toggle", "Credential", "Replace", "Live"] },
  { id: "visible", icon: BarChart3, items: ["Panels", "Activity", "Scope"] },
  { id: "seo", icon: Search, items: ["PerAudit", "Shows", "Off"] },
  { id: "never", icon: EyeOff, items: ["Billing", "Keys", "Other"] },
];

const WORKSPACES_SPEC: SectionSpec[] = [
  { id: "workspaces", icon: FolderKanban, items: ["Grouping", "Active", "Rename", "Delete"] },
  { id: "sites", icon: Globe, items: ["Domain", "SiteId", "Waiting", "Remove"] },
  { id: "install", icon: Code2, items: ["Where", "Spa", "Blockers"] },
];

const HOME_SPEC: SectionSpec[] = [
  { id: "widgets", icon: LayoutGrid, items: ["What", "Sources", "Range", "Empty"] },
  { id: "customize", icon: SlidersHorizontal, items: ["Add", "Reorder", "Save", "Discard"] },
  { id: "scope", icon: FolderKanban, items: ["Workspace", "AllSites", "Deeper"] },
];

const MEMBERS_SPEC: SectionSpec[] = [
  { id: "roles", icon: Users, items: ["Owner", "Admin", "Member", "Change"] },
  { id: "invites", icon: UserPlus, items: ["Send", "Pending", "Expiry", "Revoke"] },
  { id: "scope", icon: FolderKanban, items: ["PerWorkspace", "Billing", "Remove"] },
];

const SOCIAL_SPEC: SectionSpec[] = [
  { id: "compose", icon: PenLine, items: ["Draft", "Accounts", "Preview", "Quota"] },
  { id: "schedule", icon: Clock, items: ["When", "Timezone", "Calendar", "Edit"] },
  { id: "delivery", icon: Send, items: ["Sent", "Failed", "Retry"] },
  { id: "accounts", icon: Link2, items: ["Connect", "Expired", "Disconnect"] },
];

const FORMS_SPEC: SectionSpec[] = [
  { id: "builder", icon: LayoutGrid, items: ["Fields", "Required", "Options", "Reorder"] },
  { id: "publish", icon: Share2, items: ["Draft", "Link", "Embed", "Close"] },
  { id: "submissions", icon: FileSpreadsheet, items: ["Where", "Export", "Notify", "Retention"] },
  { id: "locked", icon: AlertTriangle, items: ["Keys", "Rename", "Removed"] },
];

/**
 * Route path to the help it opens.
 *
 * Matched exactly against `location.pathname`, matching how the nav rail marks
 * its active item. Analytics and SEO are absent on purpose — they render their
 * own drawer, next to the controls their help describes.
 */
const PAGE_SPECS: Record<string, { ns: string; spec: SectionSpec[] }> = {
  "/app/reports": { ns: "reports", spec: REPORTS_SPEC },
  "/app/billing": { ns: "billing", spec: BILLING_SPEC },
  "/app/developers": { ns: "developers", spec: DEVELOPERS_SPEC },
  "/app/share": { ns: "share", spec: SHARE_SPEC },
  "/app/workspaces": { ns: "workspaces", spec: WORKSPACES_SPEC },
  "/app": { ns: "home", spec: HOME_SPEC },
  "/app/members": { ns: "members", spec: MEMBERS_SPEC },
  "/app/social": { ns: "social", spec: SOCIAL_SPEC },
  "/app/forms": { ns: "forms", spec: FORMS_SPEC },
};

/** Whether a route has help at all — cheap enough to call during render. */
export function hasPageHelp(pathname: string): boolean {
  return pathname in PAGE_SPECS;
}

/**
 * Resolve a route's help into translated sections.
 *
 * Returns null for a route with no help, so a caller can render nothing
 * without first testing the path itself.
 */
export function getPageHelp(
  pathname: string,
  t: TFunction,
): { title: string; sections: HelpSection[] } | null {
  const entry = PAGE_SPECS[pathname];
  if (!entry) return null;

  const { ns, spec } = entry;
  return {
    title: t(`help.${ns}.title`),
    sections: spec.map((s) => ({
      id: s.id,
      icon: s.icon,
      label: t(`help.${ns}.${s.id}Label`),
      blurb: t(`help.${ns}.${s.id}Blurb`),
      items: s.items.map((stem) => ({
        term: t(`help.${ns}.${s.id}${stem}T`),
        detail: t(`help.${ns}.${s.id}${stem}D`),
      })),
    })),
  };
}
