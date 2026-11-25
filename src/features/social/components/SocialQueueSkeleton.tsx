import { Brick, Bricks } from "@/shared/ui/Bricks";
import { brickRows } from "@/shared/lib/brickRows";
import classes from "./SocialQueue.module.css";

const QUEUE_ROWS = brickRows(4, 96);

export function SocialQueueSkeleton() {
  return (
    <div className={classes.layout} data-with-side>
      <Bricks rows={QUEUE_ROWS} label="Loading posts" />
      <div className={classes.side}>
        <Brick height={150} />
        <Brick height={190} />
      </div>
    </div>
  );
}
