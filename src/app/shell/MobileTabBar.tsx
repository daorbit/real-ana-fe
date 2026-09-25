import { Link } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Home, BarChart3, Search, CalendarClock, Menu } from "lucide-react";

/** The four destinations people open most, straight from the thumb. */
const TABS = [
  { to: "/app", labelKey: "nav.home", label: "Home", icon: Home, exact: true },
  { to: "/app/analytics", labelKey: "nav.analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/seo", labelKey: "nav.seo", label: "SEO", icon: Search },
  { to: "/app/reports", labelKey: "nav.reports", label: "Reports", icon: CalendarClock },
];

/**
 * The phone's bottom tab bar — what a native app puts under the thumb in place
 * of a side menu. The rest of the navigation is one tap away under "More",
 * which opens the navigation drawer (the header has no burger on phones).
 */
export function MobileTabBar({
  pathname,
  moreOpen,
  onMore,
}: {
  pathname: string;
  moreOpen: boolean;
  onMore: () => void;
}) {
  const { t } = useTranslation();
  const onTab = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  const anyTab = TABS.some((tab) => onTab(tab.to, tab.exact));

  return (
    <nav className="m-tabbar" aria-label={t("nav.primary", "Primary")}>
      {TABS.map(({ to, labelKey, label, icon: Icon, exact }) => {
        const active = !moreOpen && onTab(to, exact);
        return (
          <Link
            key={to}
            to={to}
            className="m-tab"
            data-active={active}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={19} strokeWidth={active ? 2.3 : 1.8} />
            <span>{t(labelKey, label)}</span>
          </Link>
        );
      })}
      <UnstyledButton
        className="m-tab"
        // "More" is where you are when the drawer is open, or when the current
        // page is one of the destinations that only lives in the drawer.
        data-active={moreOpen || !anyTab}
        aria-expanded={moreOpen}
        onClick={onMore}
      >
        <Menu size={19} strokeWidth={moreOpen || !anyTab ? 2.3 : 1.8} />
        <span>{t("nav.more", "More")}</span>
      </UnstyledButton>
    </nav>
  );
}
