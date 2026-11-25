import { Brick, Bricks } from "@/shared/ui/Bricks";
import { brickRows } from "@/shared/lib/brickRows";
import classes from "./Tasks.module.css";

const COLUMNS = [[132, 168, 112], [150, 120], [168, 132, 140], [124], [140, 160]];
const TOOLBAR = brickRows(1, 40);

export function TasksSkeleton() {
  return (
    <>
      <div className={classes.toolbar}>
        <Bricks rows={TOOLBAR} label="Loading tasks" />
      </div>
      <div className={classes.boardScroll} aria-hidden>
        <div className={classes.board}>
          {COLUMNS.map((cards, i) => (
            <div key={i} className={`${classes.column} ${classes.skeletonColumn}`}>
              <Brick height={40} />
              <div className={classes.cards}>
                {cards.map((height, j) => (
                  <Brick key={j} height={height} className={classes.skeletonCard} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
