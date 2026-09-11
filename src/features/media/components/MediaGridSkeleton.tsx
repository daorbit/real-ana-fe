import { Box, Skeleton } from "@mantine/core";
import classes from "./MediaGrid.module.css";

/**
 * The library's tiles while they load.
 *
 * Drawn into the grid's own masonry classes rather than a grid of its own, so
 * the column count and gaps are the real ones at every breakpoint and the tiles
 * do not reflow when the files arrive.
 *
 * The heights are varied and fixed: the real tiles take their height from each
 * image's aspect ratio, so a column of identical blocks would be the one thing
 * this grid never looks like.
 */
const TILE_HEIGHTS = [180, 240, 150, 210, 170, 260, 190, 220, 160, 230, 200, 175];

interface Props {
  count?: number;
  /** Matches the picker's roomier three-column wall, as `MediaGrid` does. */
  threeUp?: boolean;
}

export function MediaGridSkeleton({ count = 12, threeUp = false }: Props) {
  return (
    <Box
      className={`${classes.masonry} ${threeUp ? classes.threeUp : ""}`}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} className={classes.tile} style={{ cursor: "default" }}>
          <Skeleton height={TILE_HEIGHTS[i % TILE_HEIGHTS.length]} radius={0} />
          {/* The name and dimensions strip under each thumbnail. */}
          <Box p={10}>
            <Skeleton height={10} width={`${70 - (i % 3) * 12}%`} radius="sm" />
            <Skeleton height={8} width="45%" mt={8} radius="sm" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
