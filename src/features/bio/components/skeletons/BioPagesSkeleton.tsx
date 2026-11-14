import { Skeleton } from "@mantine/core";
import classes from "./BioSkeleton.module.css";

const CARDS = [0, 1, 2];
const STATS = [0, 1, 2];

function PageCardSkeleton() {
  return (
    <div className={classes.pageCard}>
      <div className={classes.pageHead}>
        <Skeleton circle height={44} />
        <div className={classes.rowText}>
          <Skeleton height={13} width="58%" radius="xl" />
          <Skeleton height={10} width="42%" radius="xl" />
        </div>
        <Skeleton height={18} width={18} radius={6} />
      </div>
      <div className={classes.stats}>
        {STATS.map((i) => (
          <div key={i} className={classes.stat}>
            <Skeleton height={18} width={44} radius={6} />
            <Skeleton height={9} width={52} radius="xl" />
          </div>
        ))}
      </div>
      <div className={classes.foot}>
        <Skeleton height={18} width={34} radius="xl" />
        <Skeleton height={10} width={56} radius="xl" />
        <div className={classes.footIcons}>
          {STATS.map((i) => (
            <Skeleton key={i} height={18} width={18} radius={6} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BioPagesSkeleton() {
  return (
    <section aria-busy aria-label="Loading your pages">
      <div className={classes.sectionHead}>
        <Skeleton height={13} width={96} radius="xl" />
        <Skeleton height={10} width={160} radius="xl" />
      </div>
      <div className={classes.grid}>
        {CARDS.map((i) => (
          <PageCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
