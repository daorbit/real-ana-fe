import { Skeleton } from "@mantine/core";
import classes from "./AuditLog.module.css";
import detail from "./AuditDetail.module.css";
import overview from "./AuditOverview.module.css";

const INSPECTOR_ROWS = [
  [52, 90],
  [40, 150],
  [44, 130],
  [36, 110],
  [48, 124],
];

export function AuditOverviewSkeleton() {
  return (
    <section className={overview.card}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={overview.stat}>
          <Skeleton height={10} width={70} radius="sm" />
          <Skeleton height={26} width={64} mt={8} radius="sm" />
          <Skeleton height={10} width={100} mt={8} radius="sm" />
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
          <Skeleton height={36} width={36} circle />
          <div className={classes.skelBody}>
            <Skeleton height={12} width={`${72 - i * 7}%`} radius="sm" />
            <Skeleton height={10} width={`${48 - i * 3}%`} radius="sm" />
          </div>
          <Skeleton height={10} width={52} radius="sm" />
        </div>
      ))}
    </div>
  );
}

function AuditInspectorSkeleton() {
  return (
    <div className={detail.inspector} aria-hidden>
      <div className={detail.head}>
        <Skeleton height={10} width={110} radius="sm" />
        <Skeleton height={16} width="90%" mt={6} radius="sm" />
        <Skeleton height={16} width="55%" mt={4} radius="sm" />
      </div>
      <div className={detail.skeletonRows}>
        {INSPECTOR_ROWS.map(([key, value]) => (
          <div key={`${key}-${value}`} className={detail.skeletonRow}>
            <Skeleton height={11} width={key} radius="sm" />
            <Skeleton height={11} width={value} radius="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditSkeleton() {
  return (
    <div className={classes.layout}>
      <div className={classes.days}>
        <section>
          <Skeleton height={10} width={56} mb={12} ml={4} radius="sm" />
          <AuditRowsSkeleton rows={2} />
        </section>
        <section>
          <Skeleton height={10} width={80} mb={12} ml={4} radius="sm" />
          <AuditRowsSkeleton rows={5} />
        </section>
      </div>
      <AuditInspectorSkeleton />
    </div>
  );
}
