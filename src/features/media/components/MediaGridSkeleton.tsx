import { Box } from "@mantine/core";
import { Brick } from "@/shared/ui/Bricks";
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
      {Array.from({ length: count }, (_, i) => (
        <Brick key={i} height="auto" className={classes.thumb} />
      ))}
    </Box>
  );
}
