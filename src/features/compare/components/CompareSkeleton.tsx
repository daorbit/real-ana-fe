import { Skeleton } from "@mantine/core";
import classes from "./Compare.module.css";
import rail from "./Rail.module.css";
import standings from "./Standings.module.css";
import header from "./DetailHeader.module.css";
import trend from "./trend/Trend.module.css";

function OverviewSkeleton() {
  return (
    <div className={classes.overview}>
      <section className={`${standings.card} tone-tile`} data-tone="slate">
        <Skeleton height={9} width={90} radius="sm" />
        <Skeleton height={36} width={80} mt={14} radius="sm" />
        <Skeleton height={10} width="80%" mt={14} radius="sm" />
        <div className={standings.stats}>
          {[0, 1].map((i) => (
            <div key={i} className={standings.stat}>
              <Skeleton height={9} width="50%" radius="sm" />
              <Skeleton height={22} width={46} radius="sm" />
              <Skeleton height={5} radius="xl" />
            </div>
          ))}
        </div>
      </section>

      <section className={`${trend.card} tone-tile`} data-tone="slate">
        <Skeleton height={13} width={130} radius="sm" />
        <Skeleton height={9} width="55%" mt={8} radius="sm" />
        <Skeleton height={220} mt={18} radius="md" />
      </section>
    </div>
  );
}

function RailSkeleton() {
  return (
    <aside className={classes.rail}>
      <div className={`${rail.panel} glass`}>
        <div className={rail.head}>
          <Skeleton height={13} width={96} radius="sm" />
          <Skeleton height={11} width={60} radius="sm" />
        </div>
        <div className={rail.add}>
          <Skeleton height={36} radius="md" />
        </div>
        <div className={rail.list}>
          {[72, 64, 56, 60].map((w, i) => (
            <div key={i} className={classes.skelRow}>
              <Skeleton height={18} width={18} radius="sm" />
              <div className={classes.skelLines}>
                <Skeleton height={11} width={`${w}%`} radius="sm" />
                <Skeleton height={9} width="42%" radius="sm" />
              </div>
              <Skeleton height={13} width={22} radius="sm" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function DetailSkeleton() {
  return (
    <div className={classes.detail}>
      <section className={`${header.card} glass`}>
        <div className={header.top}>
          <div className={header.identity}>
            <Skeleton height={44} width={44} radius={13} />
            <div className={classes.skelLines}>
              <Skeleton height={16} width={160} radius="sm" />
              <Skeleton height={10} width={220} radius="sm" />
            </div>
          </div>
          <Skeleton height={22} width={70} radius="xl" />
        </div>
        <div className={header.tiles}>
          <Skeleton height={96} radius={14} />
          <Skeleton height={96} radius={14} />
        </div>
      </section>

      <Skeleton height={42} radius="md" />

      <section className={`${classes.card} glass`}>
        <Skeleton height={13} width={180} radius="sm" />
        <div className={classes.skelStack}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={46} radius={12} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function CompareSkeleton() {
  return (
    <>
      <OverviewSkeleton />
      <div className={classes.workspace}>
        <RailSkeleton />
        <DetailSkeleton />
      </div>
    </>
  );
}
