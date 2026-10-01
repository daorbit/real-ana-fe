import { Skeleton } from "@mantine/core";
import classes from "./Receipts.module.css";

export function ReceiptsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <>
      <div className={classes.stats}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={classes.stat}>
            <Skeleton height={10} width={84} radius="sm" />
            <Skeleton height={22} width={120} mt={14} radius="sm" />
          </div>
        ))}
      </div>

      <div className={classes.list}>
        <div className={`${classes.row} ${classes.headRow}`}>
          <Skeleton height={8} width={40} radius="sm" />
          <Skeleton height={8} width={36} radius="sm" />
          <span className={classes.skelEnd}>
            <Skeleton height={8} width={52} radius="sm" />
          </span>
          <span />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={classes.row}>
            <div className={classes.item}>
              <Skeleton height={38} width={38} radius={11} />
              <div className={classes.itemText}>
                <Skeleton height={12} width={`${68 - i * 9}%`} radius="sm" />
                <Skeleton height={9} width={150} maw="100%" mt={8} radius="sm" />
              </div>
            </div>
            <span className={classes.date}>
              <Skeleton height={10} width={86} radius="sm" />
            </span>
            <span className={`${classes.amount} ${classes.skelEnd}`}>
              <Skeleton height={12} width={64} radius="sm" />
            </span>
            <span className={classes.download}>
              <Skeleton height={34} width={34} radius="md" />
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
