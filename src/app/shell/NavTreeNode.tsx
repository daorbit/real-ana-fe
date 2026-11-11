import { useEffect, type ReactNode } from "react";
import { UnstyledButton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { NavLink } from "./NavLink";
import { navImage } from "./NavItemIcon";
import { usePersistedFlag } from "./useRailState";
import type { NavItem } from "./navItems";
import classes from "./FavouriteLinks.module.css";

export function NavTreeNode({
  item,
  label,
  active,
  openKey,
  forceOpen,
  count,
  toggleLabel,
  children,
}: {
  item: NavItem;
  label: string;
  active: boolean;
  openKey: string;
  forceOpen: boolean;
  count?: number;
  toggleLabel: string;
  children: ReactNode;
}) {
  const [open, toggle, setOpen] = usePersistedFlag(openKey, item.defaultOpen ?? true);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen, setOpen]);

  return (
    <div className={classes.node}>
      <div className={classes.head}>
        <NavLink to={item.to} label={label} icon={item.icon} image={navImage(item)} tone={item.tone} active={active} />
        <UnstyledButton
          className={classes.toggle}
          onClick={toggle}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${toggleLabel}`}
        >
          {count !== undefined && <span className={classes.count}>{count}</span>}
          <ChevronRight size={13} className={classes.chevron} data-open={open || undefined} />
        </UnstyledButton>
      </div>
      {open && children}
    </div>
  );
}
