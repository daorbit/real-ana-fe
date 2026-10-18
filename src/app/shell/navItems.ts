import {
  Home, BarChart3, FolderKanban, Code2, Users, Search, CalendarClock,
  Send, CreditCard, Swords, Share2, Route, Palette, Images, TrendingUp,
  LayoutDashboard, Flag, Settings, ScrollText, Blocks, Star, BellRing, AppWindow,
} from "lucide-react";
import type { WorkspaceAppId } from "@/shared/types";
import { ADMIN_SECTIONS, adminSectionPath } from "@/features/admin/lib/adminSections";
import { LeadMagnetIcon } from "./icons";


export type NavItem = {
  to: string;
  /** i18n key, with `label` as the fallback when a locale lacks it. */
  labelKey: string;
  label: string;
  icon: typeof Home;
  external?: boolean;
  linkUrl?: string;
  logoUrl?: string;
  app?: WorkspaceAppId;
};

export type NavGroup = {
  headingKey: string;
  heading: string;
  items: NavItem[];
  collapsible?: boolean;
};


export const NAV_GROUPS: NavGroup[] = [
  {
    headingKey: "nav.groupAnalyze",
    heading: "Analyze",
    items: [
      { to: "/app/apps", labelKey: "nav.apps", label: "Apps", icon: Blocks },
      { to: "/app", labelKey: "nav.home", label: "Home", icon: Home },
      { to: "/app/analytics", labelKey: "nav.websiteAnalytics", label: "Website analytics", icon: BarChart3 },
      { to: "/app/dashboards", labelKey: "nav.dashboards", label: "Dashboards", icon: LayoutDashboard },
      { to: "/app/goals", labelKey: "nav.goals", label: "Goals", icon: Flag, app: "goals" },
      { to: "/app/alerts", labelKey: "nav.alerts", label: "Alerts", icon: BellRing, app: "alerts" },

      { to: "/app/journey", labelKey: "nav.journey", label: "User journeys", icon: Route },
      { to: "/app/search-visibility", labelKey: "nav.searchVisibility", label: "Search visibility", icon: TrendingUp },
      { to: "/app/seo", labelKey: "nav.seo", label: "SEO", icon: Search },
      // Hidden from the sidebar for now; the /app/backlinks route still works.
      // { to: "/app/backlinks", labelKey: "nav.backlinks", label: "Backlinks", icon: Link2 },

      { to: "/app/compare", labelKey: "nav.compare", label: "Compare", icon: Swords, app: "compare" },
    ],
  },
  {
    headingKey: "nav.groupEngage",
    heading: "Engage",
    items: [
      { to: "/app/reports", labelKey: "nav.reports", label: "Reports", icon: CalendarClock },
      { to: "/app/social", labelKey: "nav.social", label: "Scheduled posts", icon: Send },
      { to: "/app/lead-capture", labelKey: "nav.leadCapture", label: "Lead capture", icon: LeadMagnetIcon },
      { to: "/app/popups", labelKey: "nav.popups", label: "Popups", icon: AppWindow, app: "popups" },
      { to: "/app/reviews", labelKey: "nav.reviews", label: "Reviews", icon: Star, app: "reviews" },
      { to: "/app/share", labelKey: "nav.share", label: "Public dashboard", icon: Share2 },
    ],
  },
  {
    headingKey: "nav.groupWorkspace",
    heading: "Workspace",
    items: [
      { to: "/app/workspaces", labelKey: "nav.workspaces", label: "Workspaces", icon: FolderKanban },
      { to: "/app/members", labelKey: "nav.members", label: "Members", icon: Users },
      { to: "/app/audit-log", labelKey: "nav.auditLog", label: "Audit log", icon: ScrollText },
      { to: "/app/branding", labelKey: "nav.branding", label: "Branding", icon: Palette },
      { to: "/app/media", labelKey: "nav.media", label: "Media", icon: Images, app: "media" },
      { to: "/app/developers", labelKey: "nav.developers", label: "Developers", icon: Code2 },
      { to: "/app/billing", labelKey: "nav.billing", label: "Billing", icon: CreditCard },
      { to: "/app/settings", labelKey: "nav.settings", label: "Settings", icon: Settings },
    ],
  },
];


export const ADMIN_ITEMS: NavItem[] = ADMIN_SECTIONS.map((section) => ({
  to: adminSectionPath(section.id),
  labelKey: section.labelKey,
  label: section.label,
  icon: section.icon,
}));
