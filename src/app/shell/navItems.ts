import {
  Home, Swords, Images, Flag, BellRing, Filter, ReceiptText,
  ListTodo, Mail,
  // AppWindow, Link2, ScanSearch, FlaskConical, Star,
} from "lucide-react";
import type { WorkspaceAppId } from "@/shared/types";
import { ADMIN_SECTIONS, adminSectionPath, type AdminSectionId } from "@/features/admin/lib/adminSections";
import { AllAppsColorIcon } from "./colorIcons";
import {
  AnalyticsNavIcon, AuditLogNavIcon, BillingNavIcon, BrandingNavIcon, DashboardsNavIcon,
  BookingsNavIcon, DevelopersNavIcon, FormAnalyticsNavIcon, LeadSourcesNavIcon, HomeNavIcon, LeadCaptureNavIcon, MembersNavIcon, RankLabNavIcon, ReportsNavIcon,
  ScheduledPostsNavIcon, SearchVisibilityNavIcon, SettingsNavIcon, WorkspacesNavIcon,
} from "./navIcons";

export type NavTone =
  | "blue" | "green" | "teal" | "indigo" | "pink" | "orange" | "violet" | "amber" | "cyan"
  | "sky" | "magenta" | "gold" | "mint" | "red" | "brown" | "slate";

export type NavItem = {
  to: string;
  /** i18n key, with `label` as the fallback when a locale lacks it. */
  labelKey: string;
  label: string;
  keywords?: string;
  icon: typeof Home;
  external?: boolean;
  linkUrl?: string;
  logoUrl?: string;
  app?: WorkspaceAppId | WorkspaceAppId[];
  showWhenOff?: boolean;
  tone?: NavTone;
  quiet?: boolean;
  children?: NavChild[];
};

export type NavChild = { to: string; labelKey: string; label: string; keywords?: string; icon: typeof Home };

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
      { to: "/app", labelKey: "nav.home", label: "Home", icon: HomeNavIcon, tone: "sky" },
      { to: "/app/dashboards", labelKey: "nav.dashboards", label: "Dashboards", icon: DashboardsNavIcon, tone: "magenta" },
      { to: "/app/analytics", labelKey: "nav.websiteAnalytics", label: "Website analytics", icon: AnalyticsNavIcon, tone: "blue" },
    ],
  },
  {
    headingKey: "nav.groupGrowth",
    heading: "Growth",
    items: [
      { to: "/app/search-visibility", labelKey: "nav.searchVisibility", label: "Search visibility", icon: SearchVisibilityNavIcon, tone: "green" },
      { to: "/app/seo", labelKey: "nav.seo", label: "SEO", keywords: "seo audit", icon: RankLabNavIcon, tone: "teal" },
      {
        to: "/app/lead-capture",
        labelKey: "nav.leadCapture",
        label: "Lead capture",
        icon: LeadCaptureNavIcon,
        tone: "orange",
        children: [
          { to: "/app/lead-insights", labelKey: "nav.leadInsights", label: "Lead insights", keywords: "form analytics forms responses conversion", icon: FormAnalyticsNavIcon },
          { to: "/app/lead-sources", labelKey: "nav.leadSources", label: "Lead sources", keywords: "utm campaigns referrers attribution", icon: LeadSourcesNavIcon },
          { to: "/app/bookings", labelKey: "nav.bookings", label: "Bookings", keywords: "meetings calendar appointments", icon: BookingsNavIcon },
        ],
      },
      { to: "/app/social", labelKey: "nav.social", label: "Scheduled posts", icon: ScheduledPostsNavIcon, tone: "pink" },
      { to: "/app/reports", labelKey: "nav.reports", label: "Reports", icon: ReportsNavIcon, tone: "indigo" },
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
      { to: "/app/campaigns", labelKey: "nav.campaigns", label: "Campaigns", keywords: "email newsletter marketing", icon: Mail, app: "campaigns", showWhenOff: true },
      { to: "/app/tasks", labelKey: "nav.tasks", label: "Tasks", icon: ListTodo, app: "tasks", showWhenOff: true },
      { to: "/app/invoices", labelKey: "nav.invoices", label: "Invoices", icon: ReceiptText, app: "invoicing", showWhenOff: Boolean(import.meta.env.VITE_INVOICES_URL) },
      { to: "/app/media", labelKey: "nav.media", label: "Media", icon: Images, app: "media" },
      { to: "/app/apps", labelKey: "nav.allApps", label: "App Store", icon: AllAppsColorIcon, tone: "gold", quiet: true },
    ],
  },
  {
    headingKey: "nav.groupWorkspace",
    heading: "Workspace",
    items: [
      { to: "/app/members", labelKey: "nav.members", label: "Members", icon: MembersNavIcon, tone: "cyan" },
      { to: "/app/branding", labelKey: "nav.branding", label: "Branding", icon: BrandingNavIcon, tone: "violet" },
      { to: "/app/billing", labelKey: "nav.billing", label: "Billing", icon: BillingNavIcon, tone: "mint" },
      { to: "/app/developers", labelKey: "nav.developers", label: "Developers", icon: DevelopersNavIcon, tone: "red" },
      { to: "/app/audit-log", labelKey: "nav.auditLog", label: "Audit log", icon: AuditLogNavIcon, tone: "brown" },
      { to: "/app/workspaces", labelKey: "nav.workspaces", label: "Workspaces", icon: WorkspacesNavIcon, tone: "amber" },
      { to: "/app/settings", labelKey: "nav.settings", label: "Settings", icon: SettingsNavIcon, tone: "slate" },
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

export function withChildren(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ?? []).map((child) => ({ ...item, ...child, children: undefined })),
  ]);
}
