import { Box, Skeleton } from "@mantine/core";
import classes from "./MediaGrid.module.css";

interface Props {
  count?: number;
  threeUp?: boolean;
  picker?: boolean;
}

export function MediaGridSkeleton({ count = 12, threeUp = false, picker = false }: Props) {
  const layout = picker ? classes.picker : threeUp ? classes.threeUp : "";

  return (
    <Box className={`${classes.masonry} ${layout}`} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} className={`${classes.tile} ${classes.skeletonTile}`}>
          <Skeleton className={classes.thumb} radius={0} />
          <Box className={classes.skeletonMeta}>
            <Skeleton height={10} width={`${72 - (i % 3) * 14}%`} radius="sm" />
            <Skeleton height={8} width="42%" radius="sm" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
