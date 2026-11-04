import { HomeColorIcon, SearchVisibilityColorIcon, SeoColorIcon, WebsiteAnalyticsIcon } from "./colorIcons";

export const MOBILE_TABS = [
  { to: "/app", labelKey: "nav.home", label: "Home", icon: HomeColorIcon, exact: true },
  { to: "/app/analytics", labelKey: "nav.analytics", label: "Analytics", icon: WebsiteAnalyticsIcon },
  { to: "/app/search-visibility", labelKey: "nav.visibilityShort", label: "Visibility", icon: SearchVisibilityColorIcon },
  { to: "/app/seo", labelKey: "nav.seo", label: "Rank Lab", icon: SeoColorIcon },
];

export const MOBILE_TAB_PATHS = new Set(MOBILE_TABS.map((tab) => tab.to));
