import { UnstyledButton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { NavLink } from "./NavLink";
import { FavouriteLinks } from "./FavouriteLinks";
import { usePersistedFlag } from "./useRailState";
import type { NavItem } from "./navItems";
import type { FavouriteDashboard } from "@/features/dashboards/favourites";
import classes from "./FavouriteLinks.module.css";

const OPEN_KEY = "nav:favourites-open";

export function DashboardsTreeNode({
  item,
  label,
  active,
  pathname,
  favourites,
  onFavourite,
}: {
  item: NavItem;
  label: string;
  active: boolean;
  pathname: string;
  favourites: FavouriteDashboard[];
  onFavourite: boolean;
}) {
  const [stored, toggle] = usePersistedFlag(OPEN_KEY, true);
  const open = stored || onFavourite;

  return (
    <div className={classes.node}>
      <div className={classes.head}>
        <NavLink to={item.to} label={label} icon={item.icon} active={active} />
        <UnstyledButton
          className={classes.toggle}
          onClick={toggle}
          aria-expanded={open}
          aria-label={open ? "Collapse favourite dashboards" : "Expand favourite dashboards"}
          disabled={onFavourite}
        >
          <span className={classes.count}>{favourites.length}</span>
          <ChevronRight size={13} className={classes.chevron} data-open={open || undefined} />
        </UnstyledButton>
      </div>
      {open && <FavouriteLinks pathname={pathname} favourites={favourites} />}
    </div>
  );
}
