import { useState } from "react";
import { Box, UnstyledButton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "./NavLink";
import type { NavGroup } from "./navItems";

/**
 * One titled block of rail rows.
 *
 * Every group folds, not only the ones marked `collapsible` — the heading is
 * the fold control, so a heading that did nothing when clicked would be the
 * odd one out. `collapsible` still decides where the open/closed state lives:
 * the admin group answers to the rail so its state survives a remount, the
 * rest keep their own and start open.
 */
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
  const [ownOpen, setOwnOpen] = useState(true);

  // A folded group still shows its rows when one of them is the page you are
  // on — hiding the item that is currently highlighted leaves the navigation
  // with nothing marked.
  const holdsCurrent = group.items.some((n) => n.to === pathname);
  const open = group.collapsible
    ? adminOpen || holdsCurrent
    : ownOpen || holdsCurrent;
  const toggle = group.collapsible ? onToggleAdmin : () => setOwnOpen((v) => !v);

  const rows = group.items.map((n) => (
    <NavLink
      key={n.to}
      to={n.to}
      label={t(n.labelKey, n.label)}
      icon={n.icon}
      active={pathname === n.to}
      collapsed={collapsed}
    />
  ));

  return (
    <Box className="nav-group" mb={14}>
      {collapsed && showRule && <Box className="nav-rule" mb={6} />}

      {!collapsed && (
        <UnstyledButton
          className="nav-heading nav-heading--button"
          onClick={toggle}
          aria-expanded={open}
        >
          <ChevronRight
            size={15}
            className="nav-heading__chevron"
            data-open={open || undefined}
          />
          <span>{t(group.headingKey, group.heading)}</span>
        </UnstyledButton>
      )}

      {/* Rendered outright rather than through an animated container: the rows
          are the rail's whole purpose, and a height animation that mismeasures
          leaves the navigation empty. Collapsed there is no heading to fold
          with, so they always show — otherwise a group could be shut with no
          visible way to reopen it. */}
      {(collapsed || open) && <div>{rows}</div>}
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
