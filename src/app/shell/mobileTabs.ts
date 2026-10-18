import { Home, BarChart3, Search, CalendarClock, TrendingUp } from "lucide-react";

export const MOBILE_TABS = [
  { to: "/app", labelKey: "nav.home", label: "Home", icon: Home, exact: true },
  { to: "/app/analytics", labelKey: "nav.analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/search-visibility", labelKey: "nav.searchVisibility", label: "Search visibility", icon: TrendingUp },
  { to: "/app/seo", labelKey: "nav.seo", label: "SEO", icon: Search },
  { to: "/app/reports", labelKey: "nav.reports", label: "Reports", icon: CalendarClock },
];

export const MOBILE_TAB_PATHS = new Set(MOBILE_TABS.map((tab) => tab.to));
