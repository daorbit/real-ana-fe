import { ActionIcon, Tooltip } from "@mantine/core";
import { Star } from "lucide-react";
import { notify } from "@/shared/lib/notify";
import { MAX_FAVOURITES, toggleFavourite, useFavouriteDashboards } from "@/features/dashboards/favourites";
import classes from "@/features/dashboards/components/FavouriteButton.module.css";

export function FavouriteButton({
  workspaceId,
  id,
  name,
  size = "md",
}: {
  workspaceId: string;
  id: string;
  name: string;
  size?: "md" | "lg";
}) {
  const favourites = useFavouriteDashboards(workspaceId);
  const active = favourites.some((f) => f.id === id);
  const label = active ? "Remove from sidebar" : "Add to sidebar";

  const toggle = () => {
    if (!active && favourites.length >= MAX_FAVOURITES) {
      notify.info(`You can keep up to ${MAX_FAVOURITES} favourite dashboards in the sidebar.`);
      return;
    }
    toggleFavourite(workspaceId, { id, name });
  };

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        variant={size === "lg" ? "default" : "subtle"}
        color="gray"
        size={size}
        className={classes.star}
        data-active={active || undefined}
        aria-label={label}
        aria-pressed={active}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Star size={size === "lg" ? 16 : 15} />
      </ActionIcon>
    </Tooltip>
  );
}
