import { Skeleton } from "@mantine/core";
import classes from "./UsageOverview.module.css";

const BAR_HEIGHTS = ["38%", "62%", "30%", "78%", "52%", "92%"];

function CardHeadSkeleton({ subtitle = 300 }: { subtitle?: number }) {
  return (
    <header className={classes.cardHead}>
      <div>
        <Skeleton height={12} width={150} radius="sm" />
        <Skeleton height={10} width={subtitle} maw="100%" mt={8} radius="sm" />
      </div>
    </header>
  );
}

export function UsageTabSkeleton() {
  return (
    <div className={classes.root}>
      <section className={classes.hero}>
        <div>
          <Skeleton height={10} width={210} radius="sm" />
          <Skeleton height={44} width={150} mt={14} radius="md" />
          <Skeleton height={8} mt={22} radius="xl" />
          <div className={classes.heroMeta}>
            <Skeleton height={10} width={150} radius="sm" />
            <Skeleton height={10} width={56} radius="sm" />
          </div>
        </div>
        <div className={classes.carry}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={classes.carryRow}>
              <Skeleton height={28} width={28} radius={9} />
              <div className={classes.skelLines}>
                <Skeleton height={9} width="85%" radius="sm" />
                <Skeleton height={9} width="55%" radius="sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={classes.card}>
        <CardHeadSkeleton subtitle={420} />
        <ul className={classes.allowances}>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className={classes.allowance}>
              <Skeleton className={classes.skelIcon} height={38} width={38} radius={11} />
              <div className={classes.allowanceText}>
                <Skeleton height={12} width={`${55 - (i % 3) * 8}%`} radius="sm" />
                <Skeleton height={9} width="38%" mt={6} radius="sm" />
              </div>
              <div className={classes.allowanceValue}>
                <Skeleton height={14} width={72} radius="sm" />
                <Skeleton height={9} width={28} mt={6} radius="sm" />
              </div>
              <div className={classes.skelTrack}>
                <Skeleton height={6} radius="xl" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={classes.card}>
        <CardHeadSkeleton subtitle={380} />
        <div className={`${classes.chartBody} ${classes.skelBars}`}>
          {BAR_HEIGHTS.map((h, i) => (
            <Skeleton key={i} height={h} width={36} radius={6} />
          ))}
        </div>
      </section>

      <div className={classes.grid}>
        <section className={classes.card}>
          <CardHeadSkeleton subtitle={340} />
          <div className={classes.skelRows}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={12} width={`${92 - i * 6}%`} radius="sm" />
            ))}
          </div>
        </section>
        <section className={classes.card}>
          <CardHeadSkeleton subtitle={220} />
          <div className={classes.skelRows}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={classes.carryRow}>
                <Skeleton height={12} width={12} circle />
                <div className={classes.skelLines}>
                  <Skeleton height={11} width="50%" radius="sm" />
                  <Skeleton height={9} width="30%" radius="sm" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
