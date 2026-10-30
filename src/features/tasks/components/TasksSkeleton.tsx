import { Skeleton } from "@mantine/core";
import classes from "./Tasks.module.css";

const COLUMNS = [
  [96, 132, 78],
  [118, 84],
  [140, 96, 110],
  [88],
  [104, 126],
];

function CardSkeleton({ height }: { height: number }) {
  return (
    <div className={classes.skeletonCard}>
      <div className={classes.cardBody}>
        <Skeleton height={14} width="38%" radius="sm" />
        <div className={classes.titleRow}>
          <Skeleton height={18} width={18} circle />
          <div className={classes.skeletonLines}>
            <Skeleton height={12} radius="sm" />
            {height > 100 && <Skeleton height={12} width="70%" radius="sm" />}
          </div>
        </div>
      </div>
      <div className={classes.cardFoot}>
        <Skeleton height={22} width={58} radius="sm" />
        <span className={classes.footEnd}>
          <Skeleton height={26} width={26} circle />
        </span>
      </div>
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading tasks">
      <div className={classes.toolbar}>
        <Skeleton height={36} width={240} radius="md" />
        <div className={classes.skeletonPeople}>
          <Skeleton height={28} width={28} circle />
          <Skeleton height={28} width={28} circle />
          <Skeleton height={28} width={28} circle />
        </div>
        <span className={classes.spacer} />
        <Skeleton height={36} width={168} radius="md" />
        <Skeleton height={36} width={236} radius="md" />
      </div>
      <div className={classes.boardScroll}>
        <div className={classes.board}>
          {COLUMNS.map((cards, i) => (
            <div key={i} className={classes.column}>
              <div className={classes.columnHead}>
                <Skeleton height={16} width={110} radius="sm" />
              </div>
              <div className={classes.skeletonAdd}>
                <Skeleton height={12} width={80} radius="sm" />
              </div>
              <div className={classes.cards}>
                {cards.map((h, j) => (
                  <CardSkeleton key={j} height={h} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
