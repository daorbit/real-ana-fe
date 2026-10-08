import { Link, useNavigate } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import { LayoutDashboard } from "lucide-react";
import { prefetchRoute } from "@/app/routePrefetch";
import { isPlainLeftClick, transitionTo } from "@/app/viewTransition";
import type { FavouriteDashboard } from "@/features/dashboards/favourites";
import classes from "./FavouriteLinks.module.css";

export function FavouriteLinks({ pathname, favourites }: { pathname: string; favourites: FavouriteDashboard[] }) {
  const navigate = useNavigate();

  return (
    <ul className={classes.tree} role="group" aria-label="Favourite dashboards">
      {favourites.map((f) => {
        const to = `/app/dashboards/${f.id}`;
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <li key={f.id} className={classes.branch}>
            <UnstyledButton
              component={Link}
              to={to}
              className={classes.link}
              data-active={active || undefined}
              aria-current={active ? "page" : undefined}
              title={f.name}
              onClick={(e: React.MouseEvent) => {
                if (!isPlainLeftClick(e)) return;
                e.preventDefault();
                transitionTo(navigate, to);
              }}
              onMouseEnter={() => void prefetchRoute(to)}
              onFocus={() => void prefetchRoute(to)}
            >
              <LayoutDashboard size={13} className={classes.icon} />
              <span className={classes.name}>{f.name}</span>
            </UnstyledButton>
          </li>
        );
      })}
    </ul>
  );
}
