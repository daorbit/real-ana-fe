import { Home, BarChart3, Search, CalendarClock } from "lucide-react";

export const MOBILE_TABS = [
  { to: "/app", labelKey: "nav.home", label: "Home", icon: Home, exact: true },
  { to: "/app/analytics", labelKey: "nav.websiteAnalytics", label: "Website analytics", icon: BarChart3 },
  { to: "/app/seo", labelKey: "nav.seo", label: "SEO", icon: Search },
  { to: "/app/reports", labelKey: "nav.reports", label: "Reports", icon: CalendarClock },
];

export const MOBILE_TAB_PATHS = new Set(MOBILE_TABS.map((tab) => tab.to));
