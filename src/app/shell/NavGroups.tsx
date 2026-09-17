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
      {groups.map((group, i) => {
        // A folded group still shows its rows when one of them is the page you
        // are on — hiding the item that is currently highlighted leaves the
        // navigation with nothing marked.
        const holdsCurrent = group.items.some((n) => n.to === pathname);
        const open = !group.collapsible || adminOpen || holdsCurrent;

        // The assistant is one row that is not a report. It is set apart by
        // where it sits — alone above the groups, with a rule under it — not by
        // being painted a different colour. A nav item that looks like a banner
        // stops reading as somewhere you can go.
        const hero = group.hero;

        const rows = group.items.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            label={t(n.labelKey, n.label)}
            icon={n.icon}
            active={pathname === n.to}
            collapsed={collapsed}
            hero={hero}
          />
        ));

        if (hero) {
          return (
            <Box key={group.heading} className="nav-lead">
              {rows}
              <Box className="nav-rule" />
            </Box>
          );
        }

        return (
          <Box key={group.heading} mb="md">
            {collapsed && i > 0 && <Box className="nav-rule" mb={6} />}
            {collapsed ? null : group.collapsible ? (
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
