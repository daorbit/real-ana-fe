import { Box } from "@mantine/core";
import { Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";
import classes from "./Notifications.module.css";

const LEFT_ROWS: BrickRow[] = [{ height: 340 }, { height: 260 }];
const RIGHT_ROWS: BrickRow[] = [{ height: 170 }, { height: 420 }];

export function NotificationsSkeleton() {
  return (
    <Box className={classes.layout}>
      <Box className={classes.column}>
        <Bricks rows={LEFT_ROWS} label="Loading notification settings" />
      </Box>
      <Box className={classes.column}>
        <Bricks rows={RIGHT_ROWS} label="Loading notification settings" />
      </Box>
    </Box>
  );
}
