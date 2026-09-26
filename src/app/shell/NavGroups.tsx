import { useState } from "react";
import { Box, UnstyledButton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "./NavLink";
import type { NavGroup } from "./navItems";


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
