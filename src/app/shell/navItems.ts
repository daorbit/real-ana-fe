import {
  Home, BarChart3, FolderKanban, Code2, Users, Search, PlayCircle, CalendarClock,
  Send, CreditCard, Mail, Swords, Share2, Route, Database, Palette, Images,
} from "lucide-react";
import { LeadMagnetIcon } from "./icons";
import { SETTINGS_SECTIONS, settingsPath } from "@/features/auth/components/settings/settingsSections";


export type NavItem = {
  to: string;
  /** i18n key, with `label` as the fallback when a locale lacks it. */
  labelKey: string;
  label: string;
  icon: typeof Home;
};

export type NavGroup = {
  headingKey: string;
  heading: string;
  items: NavItem[];
  /**
   * Whether the group can be folded away.
   *
   * Only worth it for a group reached occasionally. A collapsible group that
   * someone opens on every visit is a click added to every visit.
   */
  collapsible?: boolean;
};

// Orbit is not in here. It is not one of the reports — it is the way into all
// of them for anyone who does not yet know which report they want — and as a
// one-row group at the top it read as a section someone forgot to fill. It has
// its own card at the foot of the rail instead; see `OrbitCard`.
export const NAV_GROUPS: NavGroup[] = [
  {
    headingKey: "nav.groupAnalyze",
    heading: "Analyze",
    items: [
      { to: "/app", labelKey: "nav.home", label: "Home", icon: Home },
      { to: "/app/analytics", labelKey: "nav.analytics", label: "Analytics", icon: BarChart3 },
      // Beside Analytics: this is per-user, not aggregate — the two answer
      // different questions about the same events.
      { to: "/app/journey", labelKey: "nav.journey", label: "User journeys", icon: Route },
      { to: "/app/seo", labelKey: "nav.seo", label: "SEO", icon: Search },
      // Beside SEO rather than inside it: an audit is a snapshot of one URL,
      // while a comparison is a set of rivals watched over time.
      { to: "/app/compare", labelKey: "nav.compare", label: "Compare", icon: Swords },
    ],
  },
  {
    headingKey: "nav.groupEngage",
    heading: "Engage",
    items: [
      { to: "/app/reports", labelKey: "nav.reports", label: "Reports", icon: CalendarClock },
      { to: "/app/social", labelKey: "nav.social", label: "Scheduled posts", icon: Send },
      { to: "/app/lead-capture", labelKey: "nav.leadCapture", label: "Lead capture", icon: LeadMagnetIcon },
      { to: "/app/share", labelKey: "nav.share", label: "Public dashboard", icon: Share2 },
    ],
  },
  {
    headingKey: "nav.groupWorkspace",
    heading: "Workspace",
    items: [
      { to: "/app/workspaces", labelKey: "nav.workspaces", label: "Workspaces", icon: FolderKanban },
      { to: "/app/members", labelKey: "nav.members", label: "Members", icon: Users },
      { to: "/app/branding", labelKey: "nav.branding", label: "Branding", icon: Palette },
      { to: "/app/media", labelKey: "nav.media", label: "Media", icon: Images },
      { to: "/app/developers", labelKey: "nav.developers", label: "Developers", icon: Code2 },
      { to: "/app/billing", labelKey: "nav.billing", label: "Billing", icon: CreditCard },
    ],
  },
  {
    headingKey: "nav.settings",
    heading: "Settings",
    items: SETTINGS_SECTIONS.map((s) => ({
      to: settingsPath(s.id),
      labelKey: s.labelKey,
      label: s.label,
      icon: s.icon,
    })),
  },
];


export const ADMIN_ITEMS: NavItem[] = [
  { to: "/app/admin/broadcast", labelKey: "nav.adminBroadcast", label: "Email users", icon: Mail },
  { to: "/app/impersonate", labelKey: "nav.viewAsUser", label: "Impersonate", icon: Users },
  { to: "/app/demo-usage", labelKey: "nav.demoUsage", label: "Demo usage", icon: PlayCircle },
  { to: "/app/admin/billing", labelKey: "nav.adminBilling", label: "Plans & addons", icon: CreditCard },
  { to: "/app/admin/database", labelKey: "nav.adminDatabase", label: "Database", icon: Database },
];
