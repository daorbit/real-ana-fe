import { LayoutDashboard } from "lucide-react";
import type { FavouriteDashboard } from "@/features/dashboards/favourites";
import { NavTreeLinks } from "./NavTreeLinks";

export function FavouriteLinks({ pathname, favourites }: { pathname: string; favourites: FavouriteDashboard[] }) {
  const links = favourites.map((f) => ({ key: f.id, to: `/app/dashboards/${f.id}`, label: f.name, icon: LayoutDashboard }));
  return <NavTreeLinks pathname={pathname} links={links} ariaLabel="Favourite dashboards" />;
}
