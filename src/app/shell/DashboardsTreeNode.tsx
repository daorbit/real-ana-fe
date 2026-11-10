import { FavouriteLinks } from "./FavouriteLinks";
import { NavTreeNode } from "./NavTreeNode";
import type { NavItem } from "./navItems";
import type { FavouriteDashboard } from "@/features/dashboards/favourites";

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
  return (
    <NavTreeNode
      item={item}
      label={label}
      active={active}
      openKey="nav:favourites-open"
      forceOpen={onFavourite}
      count={favourites.length}
      toggleLabel="favourite dashboards"
    >
      <FavouriteLinks pathname={pathname} favourites={favourites} />
    </NavTreeNode>
  );
}
