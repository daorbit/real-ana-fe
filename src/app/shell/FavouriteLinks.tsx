import { Link, useNavigate } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import { Star } from "lucide-react";
import { prefetchRoute } from "@/app/routePrefetch";
import { isPlainLeftClick, transitionTo } from "@/app/viewTransition";
import { useWorkspace } from "@/features/workspace/context";
import { useFavouriteDashboards } from "@/features/dashboards/favourites";
import classes from "./FavouriteLinks.module.css";

export function FavouriteLinks({ pathname }: { pathname: string }) {
  const navigate = useNavigate();
  const workspaceId = useWorkspace().active?._id;
  const favourites = useFavouriteDashboards(workspaceId);

  if (favourites.length === 0) return null;

  return (
    <div className={classes.list} aria-label="Favourite dashboards">
      {favourites.map((f) => {
        const to = `/app/dashboards/${f.id}`;
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <UnstyledButton
            key={f.id}
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
            <Star size={11} className={classes.icon} />
            <span className={classes.name}>{f.name}</span>
          </UnstyledButton>
        );
      })}
    </div>
  );
}
