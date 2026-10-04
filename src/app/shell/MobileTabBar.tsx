import { Link } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import { prefetchRoute } from "@/app/routePrefetch";
import { MOBILE_TABS as TABS } from "./mobileTabs";


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
            onTouchStart={() => void prefetchRoute(to)}
            onFocus={() => void prefetchRoute(to)}
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
