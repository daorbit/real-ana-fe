import { Box, Collapse, UnstyledButton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "./NavLink";
import type { NavGroup } from "./navItems";

 
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
  const { t } = useTranslation();

  return (
    <>
      {groups.map((group) => {
        // A folded group still shows its rows when one of them is the page you
        // are on — hiding the item that is currently highlighted leaves the
        // navigation with nothing marked.
        const holdsCurrent = group.items.some((n) => n.to === pathname);
        const open = !group.collapsible || adminOpen || holdsCurrent;

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
          <Box key={group.heading} mb="md">
            {collapsed ? (
              <Box className="nav-rule" mb={6} />
            ) : group.collapsible ? (
              <UnstyledButton
                className="nav-heading nav-heading--button"
                onClick={onToggleAdmin}
                aria-expanded={open}
              >
                <span>{t(group.headingKey, group.heading)}</span>
                <ChevronRight
                  size={12}
                  style={{
                    transition: "transform 150ms ease",
                    transform: open ? "rotate(90deg)" : undefined,
                  }}
                />
              </UnstyledButton>
            ) : (
              <p className="nav-heading">{t(group.headingKey, group.heading)}</p>
            )}

          
            {group.collapsible ? (
              <Collapse expanded={collapsed || open}>
                <div>{rows}</div>
              </Collapse>
            ) : (
              rows
            )}
          </Box>
        );
      })}
    </>
  );
}
