import { Home, BarChart3 } from "lucide-react";
import { SearchVisibilityIcon, SeoIcon } from "./icons";

export const MOBILE_TABS = [
  { to: "/app", labelKey: "nav.home", label: "Home", icon: Home, exact: true },
  { to: "/app/analytics", labelKey: "nav.analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/search-visibility", labelKey: "nav.searchVisibility", label: "Search visibility", icon: SearchVisibilityIcon },
  { to: "/app/seo", labelKey: "nav.seo", label: "SEO", icon: SeoIcon },
];

export const MOBILE_TAB_PATHS = new Set(MOBILE_TABS.map((tab) => tab.to));
