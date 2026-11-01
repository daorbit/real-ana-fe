import {
  Home, ChartColumn, FolderKanban, Code2, Users, CalendarClock,
  Send, CreditCard, Swords, Palette, Images,
  LayoutDashboard, Flag, Settings, ScrollText, Blocks, BellRing, Filter, ReceiptText,
  ListTodo,
  // AppWindow, Link2, ScanSearch, FlaskConical, Star,
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
  quiet?: boolean;
};

export type NavGroup = {
  headingKey: string;
  heading: string;
  items: NavItem[];
  collapsible?: boolean;
  bare?: boolean;
};

export const NAV_GROUPS: NavGroup[] = [
  {
    headingKey: "nav.groupOverview",
    heading: "Overview",
    bare: true,
    items: [
      { to: "/app", labelKey: "nav.home", label: "Home", icon: Home, tone: "sky" },
      { to: "/app/dashboards", labelKey: "nav.dashboards", label: "Dashboards", icon: LayoutDashboard, tone: "magenta" },
      { to: "/app/analytics", labelKey: "nav.websiteAnalytics", label: "Website analytics", icon: ChartColumn, tone: "blue" },
    ],
  },
  {
    headingKey: "nav.groupGrowth",
    heading: "Growth",
    items: [
      { to: "/app/search-visibility", labelKey: "nav.searchVisibility", label: "Search visibility", icon: SearchVisibilityIcon, tone: "green" },
      { to: "/app/seo", labelKey: "nav.seo", label: "SEO", icon: SeoIcon, tone: "teal" },
      { to: "/app/lead-capture", labelKey: "nav.leadCapture", label: "Lead capture", icon: LeadMagnetIcon, tone: "orange" },
      { to: "/app/social", labelKey: "nav.social", label: "Scheduled posts", icon: Send, tone: "pink" },
      { to: "/app/reports", labelKey: "nav.reports", label: "Reports", icon: CalendarClock, tone: "indigo" },
    ],
  },
  {
    headingKey: "nav.groupQuantalogApps",
    heading: "Q Apps",
    items: [
      // { to: "/app/insights", labelKey: "nav.insights", label: "Insights", icon: ScanSearch, app: "insights" },
      { to: "/app/goals", labelKey: "nav.goals", label: "Goals", icon: Flag, app: "goals" },
      { to: "/app/funnels", labelKey: "nav.funnels", label: "Funnels", icon: Filter, app: "funnels" },
      // { to: "/app/experiments", labelKey: "nav.experiments", label: "A/B tests", icon: FlaskConical, app: "experiments" },
      { to: "/app/alerts", labelKey: "nav.alerts", label: "Alerts", icon: BellRing, app: "alerts" },
      { to: "/app/compare", labelKey: "nav.compare", label: "Compare", icon: Swords, app: "compare" },
      // { to: "/app/popups", labelKey: "nav.popups", label: "Popups", icon: AppWindow, app: "popups" },
      // { to: "/app/bio", labelKey: "nav.bio", label: "Link in bio", icon: Link2, app: "bio" },
      // { to: "/app/reviews", labelKey: "nav.reviews", label: "Reviews", icon: Star, app: "reviews" },
      { to: "/app/tasks", labelKey: "nav.tasks", label: "Tasks", icon: ListTodo, app: "tasks" },
      { to: "/app/invoices", labelKey: "nav.invoices", label: "Invoices", icon: ReceiptText, app: "invoicing" },
      { to: "/app/media", labelKey: "nav.media", label: "Media", icon: Images, app: "media" },
      { to: "/app/apps", labelKey: "nav.allApps", label: "All apps", icon: Blocks, tone: "gold", quiet: true },
    ],
  },
  {
    headingKey: "nav.groupWorkspace",
    heading: "Workspace",
    items: [
      { to: "/app/members", labelKey: "nav.members", label: "Members", icon: Users, tone: "cyan" },
      { to: "/app/branding", labelKey: "nav.branding", label: "Branding", icon: Palette, tone: "violet" },
      { to: "/app/billing", labelKey: "nav.billing", label: "Billing", icon: CreditCard, tone: "mint" },
      { to: "/app/developers", labelKey: "nav.developers", label: "Developers", icon: Code2, tone: "red" },
      { to: "/app/audit-log", labelKey: "nav.auditLog", label: "Audit log", icon: ScrollText, tone: "brown" },
      { to: "/app/workspaces", labelKey: "nav.workspaces", label: "Workspaces", icon: FolderKanban, tone: "amber" },
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
