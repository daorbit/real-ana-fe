import { Skeleton } from "@mantine/core";
import classes from "@/features/goals/components/Goals.module.css";

export function GoalsSkeleton() {
  return (
    <>
      <div className={classes.hero}>
        <Skeleton circle height={200} />
        <div className={classes.heroBody}>
          <div>
            <Skeleton height={12} width={180} radius="sm" />
            <Skeleton height={32} width="60%" mt={12} radius="sm" />
            <Skeleton height={12} width={220} mt={12} radius="sm" />
          </div>
          <div className={classes.legend}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={60} radius={12} />
            ))}
          </div>
        </div>
      </div>
      <div className={classes.grid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={classes.card}>
            <Skeleton height={30} width="50%" radius="sm" />
            <div className={classes.cardMain}>
              <Skeleton circle height={104} />
              <div className={classes.figures}>
                <Skeleton height={12} width={140} radius="sm" />
                <Skeleton height={30} width={110} mt={8} radius="sm" />
                <Skeleton height={10} width={120} mt={6} radius="sm" />
              </div>
            </div>
            <Skeleton height={36} radius={10} />
          </div>
        ))}
      </div>
    </>
  );
}
