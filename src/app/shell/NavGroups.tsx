import { Box, UnstyledButton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "@/features/workspace/context";
import { useFavouriteDashboards } from "@/features/dashboards/favourites";
import { ExternalNavLink, NavLink } from "./NavLink";
import { DashboardsTreeNode } from "./DashboardsTreeNode";
import { navImage } from "./NavItemIcon";
import { usePersistedFlag } from "./useRailState";
import type { NavGroup } from "./navItems";

const DASHBOARDS_PATH = "/app/dashboards";

function NavGroupBlock({
  group,
  pathname,
  collapsed,
  showRule,
  adminOpen,
  onToggleAdmin,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  showRule: boolean;
  adminOpen: boolean;
  onToggleAdmin: () => void;
}) {
  const { t } = useTranslation();
  const [ownOpen, toggleOwn] = usePersistedFlag(`nav:group:${group.headingKey}`, true);
  const favourites = useFavouriteDashboards(useWorkspace().active?._id);
  const onFavourite = !collapsed && favourites.some((f) => pathname.startsWith(`${DASHBOARDS_PATH}/${f.id}`));

  const isActive = (to: string) =>
    pathname === to || (to !== "/app" && pathname.startsWith(`${to}/`));
  const holdsCurrent = group.items.some((n) => !n.external && isActive(n.to));
  const open = group.bare || (group.collapsible ? adminOpen : ownOpen) || holdsCurrent;
  const toggle = group.collapsible ? onToggleAdmin : toggleOwn;

  const rows = group.items.map((n, i) => {
    if (n.external) {
      return (
        <ExternalNavLink key={`${i}-${n.to}`} href={n.to} label={n.label} logoUrl={n.logoUrl} collapsed={collapsed} />
      );
    }
    if (n.linkUrl) {
      return (
        <NavLink
          key={n.to}
          to={n.to}
          label={n.label}
          icon={n.icon}
          logo={{ url: n.linkUrl, logoUrl: n.logoUrl }}
          active={isActive(n.to)}
          collapsed={collapsed}
        />
      );
    }
    const label = t(n.labelKey, n.label);
    const active = isActive(n.to) && !(n.to === DASHBOARDS_PATH && onFavourite);
    if (n.to === DASHBOARDS_PATH && !collapsed && favourites.length > 0) {
      return (
        <DashboardsTreeNode
          key={n.to}
          item={n}
          label={label}
          active={active}
          pathname={pathname}
          favourites={favourites}
          onFavourite={onFavourite}
        />
      );
    }
    return (
      <NavLink
        key={n.to}
        to={n.to}
        label={label}
        icon={n.icon}
        image={navImage(n)}
        tone={n.tone}
        quiet={n.quiet}
        active={active}
        collapsed={collapsed}
      />
    );
  });

  return (
    <Box className="nav-group" mb={collapsed ? 6 : 18}>
      {collapsed && showRule && <Box className="nav-rule" data-collapsed />}

      {!collapsed && !group.bare && (
        <UnstyledButton
          className="nav-heading nav-heading--button"
          onClick={toggle}
          aria-expanded={open}
        >
          <span className="nav-heading__label">{t(group.headingKey, group.heading)}</span>
          <ChevronRight
            size={12}
            className="nav-heading__chevron"
            data-open={open || undefined}
          />
        </UnstyledButton>
      )}

      {(collapsed || open) && <div className="nav-group__rows">{rows}</div>}
    </Box>
  );
}

export function NavGroups({
  groups,
  pathname,
  collapsed,
  adminOpen,
  onToggleAdmin,
}: {
  groups: NavGroup[];
  pathname: string;
  collapsed: boolean;
  adminOpen: boolean;
  onToggleAdmin: () => void;
}) {
  return (
    <>
      {groups.map((group, i) => (
        <NavGroupBlock
          key={group.heading}
          group={group}
          pathname={pathname}
          collapsed={collapsed}
          showRule={i > 0}
          adminOpen={adminOpen}
          onToggleAdmin={onToggleAdmin}
        />
      ))}
    </>
  );
}
