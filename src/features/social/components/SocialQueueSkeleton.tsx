import { Skeleton } from "@mantine/core";
import classes from "./SocialQueue.module.css";

const DAY_TITLE_WIDTHS = [56, 76, 132, 148];
const SLOT_COUNT = 4;
const WEEK_ROWS = 4;

function SlotsSkeleton() {
  return (
    <div className={classes.slots}>
      <Skeleton height={11} width={64} radius="sm" />
      <span className={classes.slotChips}>
        {Array.from({ length: SLOT_COUNT }).map((_, i) => (
          <Skeleton key={i} height={32} width={84} radius={10} />
        ))}
      </span>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className={classes.account}>
      <Skeleton height={36} width={36} radius={9} />
      <span className={classes.accountText}>
        <Skeleton height={12} width={72} radius="sm" />
        <Skeleton height={10} width={92} mt={7} radius="sm" />
      </span>
      <Skeleton height={10} width={64} radius="sm" />
    </div>
  );
}

export function SocialQueueSkeleton() {
  return (
    <div className={classes.layout} data-with-side aria-hidden>
      <div className={classes.queue}>
        {DAY_TITLE_WIDTHS.map((width) => (
          <div key={width} className={classes.day}>
            <Skeleton height={13} width={width} ml={4} radius="sm" />
            <div className={classes.card}>
              <SlotsSkeleton />
            </div>
          </div>
        ))}
      </div>

      <div className={classes.side}>
        <div className={classes.day}>
          <Skeleton height={13} width={72} ml={4} radius="sm" />
          <div className={classes.card}>
            <AccountSkeleton />
            <AccountSkeleton />
          </div>
        </div>
        <div className={classes.day}>
          <Skeleton height={13} width={84} ml={4} radius="sm" />
          <div className={classes.card}>
            {Array.from({ length: WEEK_ROWS }).map((_, i) => (
              <div key={i} className={classes.weekRow}>
                <Skeleton height={11} width={64} radius="sm" />
                <Skeleton height={11} width={i === 0 ? 120 : 44} radius="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
