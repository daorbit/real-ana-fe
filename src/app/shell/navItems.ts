import {
  Home, ChartColumn, FolderKanban, Code2, Users, CalendarClock,
  Send, CreditCard, Swords, Palette, Images,
  LayoutDashboard, Flag, Settings, ScrollText, Blocks, Star, BellRing, AppWindow, Link2, Filter, ReceiptText,
  ListTodo, ScanSearch,
} from "lucide-react";
import type { WorkspaceAppId } from "@/shared/types";
import { ADMIN_SECTIONS, adminSectionPath, type AdminSectionId } from "@/features/admin/lib/adminSections";
import { LeadMagnetIcon, SearchVisibilityIcon, SeoIcon } from "./icons";

export type NavTone =
  | "blue" | "green" | "teal" | "indigo" | "pink" | "orange" | "violet" | "amber" | "cyan"
  | "sky" | "magenta" | "gold" | "mint" | "red" | "brown" | "slate";

export type NavItem = {
  to: string;
  /** i18n key, with `label` as the fallback when a locale lacks it. */
  labelKey: string;
  label: string;
  icon: typeof Home;
  external?: boolean;
  linkUrl?: string;
  logoUrl?: string;
  app?: WorkspaceAppId | WorkspaceAppId[];
  tone?: NavTone;
};

export type NavGroup = {
  headingKey: string;
  heading: string;
  items: NavItem[];
  collapsible?: boolean;
};

export const NAV_GROUPS: NavGroup[] = [
  {
    headingKey: "nav.groupOverview",
    heading: "Overview",
    items: [
      { to: "/app", labelKey: "nav.home", label: "Home", icon: Home, tone: "sky" },
      { to: "/app/dashboards", labelKey: "nav.dashboards", label: "Dashboards", icon: LayoutDashboard, tone: "magenta" },
      { to: "/app/apps", labelKey: "nav.apps", label: "Apps", icon: Blocks, tone: "gold" },
    ],
  },
  {
    headingKey: "nav.groupAnalytics",
    heading: "Analytics",
    items: [
      { to: "/app/analytics", labelKey: "nav.websiteAnalytics", label: "Website analytics", icon: ChartColumn, tone: "blue" },
    ],
  },
  {
    headingKey: "nav.groupSearch",
    heading: "Search",
    items: [
      { to: "/app/search-visibility", labelKey: "nav.searchVisibility", label: "Search visibility", icon: SearchVisibilityIcon, tone: "green" },
      { to: "/app/seo", labelKey: "nav.seo", label: "SEO", icon: SeoIcon, tone: "teal" },
    ],
  },
  {
    headingKey: "nav.groupEngage",
    heading: "Engage",
    items: [
      { to: "/app/reports", labelKey: "nav.reports", label: "Reports", icon: CalendarClock, tone: "indigo" },
      { to: "/app/social", labelKey: "nav.social", label: "Scheduled posts", icon: Send, tone: "pink" },
      { to: "/app/lead-capture", labelKey: "nav.leadCapture", label: "Lead capture", icon: LeadMagnetIcon, tone: "orange" },
      { to: "/app/branding", labelKey: "nav.branding", label: "Branding", icon: Palette, tone: "violet" },
    ],
  },
  {
    headingKey: "nav.groupQuantalogApps",
    heading: "Quantalog apps",
    items: [
      { to: "/app/goals", labelKey: "nav.goals", label: "Goals", icon: Flag, app: "goals" },
      { to: "/app/tasks", labelKey: "nav.tasks", label: "Tasks", icon: ListTodo, app: "tasks" },
      { to: "/app/insights", labelKey: "nav.insights", label: "Insights", icon: ScanSearch, app: "insights" },
      { to: "/app/funnels", labelKey: "nav.funnels", label: "Funnels", icon: Filter, app: "funnels" },
      { to: "/app/invoices", labelKey: "nav.invoices", label: "Invoices", icon: ReceiptText, app: "invoicing" },
      { to: "/app/alerts", labelKey: "nav.alerts", label: "Alerts", icon: BellRing, app: "alerts" },
      { to: "/app/compare", labelKey: "nav.compare", label: "Compare", icon: Swords, app: "compare" },
      { to: "/app/popups", labelKey: "nav.popups", label: "Popups", icon: AppWindow, app: "popups" },
      { to: "/app/bio", labelKey: "nav.bio", label: "Link in bio", icon: Link2, app: "bio" },
      { to: "/app/reviews", labelKey: "nav.reviews", label: "Reviews", icon: Star, app: "reviews" },
      { to: "/app/media", labelKey: "nav.media", label: "Media", icon: Images, app: "media" },
    ],
  },
  {
    headingKey: "nav.groupTeam",
    heading: "Team",
    items: [
      { to: "/app/members", labelKey: "nav.members", label: "Members", icon: Users, tone: "cyan" },
      { to: "/app/audit-log", labelKey: "nav.auditLog", label: "Audit log", icon: ScrollText, tone: "brown" },
    ],
  },
  {
    headingKey: "nav.groupWorkspace",
    heading: "Workspace",
    items: [
      { to: "/app/workspaces", labelKey: "nav.workspaces", label: "Workspaces", icon: FolderKanban, tone: "amber" },
      { to: "/app/billing", labelKey: "nav.billing", label: "Billing", icon: CreditCard, tone: "mint" },
      { to: "/app/developers", labelKey: "nav.developers", label: "Developers", icon: Code2, tone: "red" },
      { to: "/app/settings", labelKey: "nav.settings", label: "Settings", icon: Settings, tone: "slate" },
    ],
  },
];

export const ADMIN_ITEMS: (NavItem & { section: AdminSectionId })[] = ADMIN_SECTIONS.map((section) => ({
  to: adminSectionPath(section.id),
  labelKey: section.labelKey,
  label: section.label,
  icon: section.icon,
  section: section.id,
}));
