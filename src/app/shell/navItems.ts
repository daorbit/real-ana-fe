import {
  Home, BarChart3, FolderKanban, Code2, Users, Search, PlayCircle, CalendarClock,
  Send, CreditCard, Mail, Inbox, LifeBuoy, Swords, Share2,
} from "lucide-react";
import { LeadMagnetIcon } from "./icons";

/**
 * What the rail contains, as data.
 *
 * Kept apart from the components that draw it so the two questions stay
 * separate: this file answers "what is in the navigation", and the components
 * beside it answer "how does a row look". Adding a page is an edit here alone.
 */

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

export const NAV_GROUPS: NavGroup[] = [
  {
    headingKey: "nav.groupAnalyze",
    heading: "Analyze",
    items: [
      { to: "/app", labelKey: "nav.home", label: "Home", icon: Home },
      { to: "/app/analytics", labelKey: "nav.analytics", label: "Analytics", icon: BarChart3 },
      { to: "/app/seo", labelKey: "nav.seo", label: "SEO", icon: Search },
      // Beside SEO rather than inside it: an audit is a snapshot of one URL,
      // while a comparison is a set of rivals watched over time.
      { to: "/app/compare", labelKey: "nav.compare", label: "Compare", icon: Swords },
    ],
  },
  {
    headingKey: "nav.groupManage",
    heading: "Manage",
    items: [
      { to: "/app/workspaces", labelKey: "nav.workspaces", label: "Workspaces", icon: FolderKanban },
      { to: "/app/share", labelKey: "nav.share", label: "Public dashboard", icon: Share2 },
      { to: "/app/reports", labelKey: "nav.reports", label: "Reports", icon: CalendarClock },
      // Beside Reports: both are "write it once, it goes out on a schedule".
      { to: "/app/social", labelKey: "nav.social", label: "Scheduled posts", icon: Send },
      // Beside the other outbound channels: a lead form is another way traffic
      // turns into something you can act on.
      { to: "/app/lead-capture", labelKey: "nav.leadCapture", label: "Leads Capture", icon: LeadMagnetIcon },
      { to: "/app/billing", labelKey: "nav.billing", label: "Billing", icon: CreditCard },
    ],
  },
];

/** Rows in the account menu rather than the rail — per-person, not per-page. */
export const ACCOUNT_ITEMS: NavItem[] = [
  { to: "/app/members", labelKey: "nav.members", label: "Members", icon: Users },
  { to: "/app/developers", labelKey: "nav.developers", label: "Developers", icon: Code2 },
  { to: "/app/help", labelKey: "nav.help", label: "Help & support", icon: LifeBuoy },
];

/**
 * Platform administration. Appended as a group for super-admins only, and the
 * one group that folds: it is a different job from using the product, reached
 * occasionally, and open it pushes the account card off shorter screens.
 */
export const ADMIN_GROUP: NavGroup = {
  headingKey: "nav.groupAdmin",
  heading: "Admin",
  collapsible: true,
  items: [
    { to: "/app/admin/contact", labelKey: "nav.adminContact", label: "Inbox", icon: Inbox },
    { to: "/app/admin/broadcast", labelKey: "nav.adminBroadcast", label: "Email users", icon: Mail },
    { to: "/app/impersonate", labelKey: "nav.viewAsUser", label: "Impersonate", icon: Users },
    { to: "/app/demo-usage", labelKey: "nav.demoUsage", label: "Demo usage", icon: PlayCircle },
    { to: "/app/admin/billing", labelKey: "nav.adminBilling", label: "Plans & addons", icon: CreditCard },
  ],
};
