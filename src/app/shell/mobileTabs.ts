import { AnalyticsNavIcon, HomeNavIcon, RankLabNavIcon, SearchVisibilityNavIcon } from "./navIcons";

export const MOBILE_TABS = [
  { to: "/app", labelKey: "nav.home", label: "Home", icon: HomeNavIcon, exact: true },
  { to: "/app/analytics", labelKey: "nav.analytics", label: "Analytics", icon: AnalyticsNavIcon },
  { to: "/app/search-visibility", labelKey: "nav.visibilityShort", label: "Visibility", icon: SearchVisibilityNavIcon },
  { to: "/app/seo", labelKey: "nav.seo", label: "Rank Lab", icon: RankLabNavIcon },
];

export const MOBILE_TAB_PATHS = new Set(MOBILE_TABS.map((tab) => tab.to));
