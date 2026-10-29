import { Box, Skeleton } from "@mantine/core";
import classes from "./MediaGrid.module.css";

interface Props {
  count?: number;
  threeUp?: boolean;
}

export function MediaGridSkeleton({ count = 12, threeUp = false }: Props) {
  return (
    <Box
      className={`${classes.masonry} ${threeUp ? classes.threeUp : ""}`}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} className={`${classes.tile} ${classes.skeletonTile}`}>
          <Skeleton className={classes.thumb} radius={0} />
          <Box p={10}>
            <Skeleton height={10} width={`${70 - (i % 3) * 12}%`} radius="sm" />
            <Skeleton height={8} width="45%" mt={8} radius="sm" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
