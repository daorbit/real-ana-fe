import { Skeleton } from "@mantine/core";
import classes from "./AuditLog.module.css";
import overview from "./AuditOverview.module.css";

export function AuditOverviewSkeleton() {
  return (
    <section className={`${overview.card} tone-tile`} data-tone="slate">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={overview.stat}>
          <Skeleton height={34} width={34} radius={10} />
          <div className={overview.statText}>
            <Skeleton height={9} width={70} radius="sm" />
            <Skeleton height={22} width={60} mt={8} radius="sm" />
            <Skeleton height={9} width={100} mt={8} radius="sm" />
          </div>
        </div>
      ))}
    </section>
  );
}

export function AuditRowsSkeleton({ rows = 5, flat = false }: { rows?: number; flat?: boolean }) {
  return (
    <div className={flat ? classes.flat : classes.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={classes.row}>
          <Skeleton height={34} width={34} circle />
          <div className={classes.skelBody}>
            <Skeleton height={11} width={`${72 - i * 7}%`} radius="sm" />
            <Skeleton height={9} width={`${40 - i * 3}%`} radius="sm" />
          </div>
          <Skeleton height={10} width={38} radius="sm" />
        </div>
      ))}
    </div>
  );
}

export function AuditSkeleton() {
  return (
    <div className={classes.days}>
      <section>
        <Skeleton height={9} width={70} mb={10} ml={4} radius="sm" />
        <AuditRowsSkeleton rows={4} />
      </section>
      <section>
        <Skeleton height={9} width={90} mb={10} ml={4} radius="sm" />
        <AuditRowsSkeleton rows={2} />
      </section>
    </div>
  );
}
