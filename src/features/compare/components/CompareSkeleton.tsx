import { Skeleton } from "@mantine/core";
import classes from "./Compare.module.css";

function Lines({ widths, gap = 12 }: { widths: (number | string)[]; gap?: number }) {
  return (
    <div className={classes.skelStack} data-gap={gap}>
      {widths.map((w, i) => (
        <Skeleton key={i} height={11} width={w} radius="sm" />
      ))}
    </div>
  );
}

function RailSkeleton() {
  return (
    <aside className={classes.rail}>
      <div className={classes.panel}>
        <div className={classes.railHead}>
          <Skeleton height={13} width={96} radius="sm" />
          <Skeleton height={11} width={34} radius="sm" />
        </div>
        <div className={classes.addForm}>
          <Skeleton height={36} radius="md" />
        </div>
        <div className={classes.baseline}>
          <Skeleton height={18} width={18} radius="sm" />
          <div className={classes.skelLines}>
            <Skeleton height={11} width="60%" radius="sm" />
            <Skeleton height={9} width="40%" radius="sm" />
          </div>
          <Skeleton height={13} width={22} radius="sm" />
        </div>
        <div className={classes.listLabel}>
          <Skeleton height={9} width={50} radius="sm" />
          <Skeleton height={9} width={70} radius="sm" />
        </div>
        <div className={classes.list}>
          {[72, 64, 56].map((w) => (
            <div key={w} className={classes.item}>
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

      <section className={classes.card}>
        <Skeleton height={13} width={150} radius="sm" />
        <Skeleton height={9} width="85%" mt={10} radius="sm" />
        <div className={classes.skelBars}>
          {[86, 70, 54].map((w) => (
            <div key={w}>
              <Skeleton height={9} width="45%" radius="sm" />
              <Skeleton height={8} width={`${w}%`} mt={6} radius="xl" />
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

function DetailSkeleton() {
  return (
    <div className={classes.detail}>
      <section className={classes.card}>
        <div className={classes.detailTop}>
          <div className={classes.identity}>
            <Skeleton height={42} width={42} radius={12} />
            <div className={classes.skelLines}>
              <Skeleton height={16} width={160} radius="sm" />
              <Skeleton height={10} width={220} radius="sm" />
            </div>
          </div>
          <Skeleton height={22} width={70} radius="xl" />
        </div>
        <div className={classes.scoreboard}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={classes.scoreCell}>
              <Skeleton height={9} width="50%" radius="sm" />
              <Skeleton height={26} width={i === 2 ? 110 : 50} mt={10} radius="sm" />
            </div>
          ))}
        </div>
        <Skeleton height={10} width="55%" mt={16} radius="sm" />
      </section>

      <section className={classes.card}>
        <Skeleton height={13} width={180} radius="sm" />
        <Lines widths={["92%", "84%", "76%"]} />
      </section>

      <section className={classes.card}>
        <Skeleton height={13} width={150} radius="sm" />
        <Skeleton height={9} width="70%" mt={10} radius="sm" />
        <div className={classes.serpGrid}>
          {[0, 1].map((i) => (
            <div key={i} className={classes.serp}>
              <Skeleton height={9} width={70} radius="sm" />
              <Skeleton height={10} width="50%" mt={10} radius="sm" />
              <Skeleton height={15} width="85%" mt={8} radius="sm" />
              <Lines widths={["100%", "80%"]} gap={8} />
            </div>
          ))}
        </div>
      </section>

      <section className={`${classes.card} ${classes.checks}`}>
        <div className={classes.cardHead}>
          <div className={classes.skelLines}>
            <Skeleton height={13} width={110} radius="sm" />
            <Skeleton height={9} width={140} radius="sm" />
          </div>
          <Skeleton height={26} width={170} radius="md" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`${classes.checkGrid} ${classes.checkRow}`}>
            <Skeleton height={11} width={`${60 - i * 6}%`} radius="sm" />
            <Skeleton height={11} width={48} radius="sm" />
            <Skeleton height={11} width={48} radius="sm" />
          </div>
        ))}
      </section>
    </div>
  );
}

export function CompareSkeleton() {
  return (
    <>
      <section className={classes.banner}>
        <div className={classes.skelLines}>
          <Skeleton height={34} width={96} radius="sm" />
          <Skeleton height={10} width={200} radius="sm" />
        </div>
        <div className={classes.stat}>
          <Skeleton height={8} width={70} radius="sm" />
          <Skeleton height={24} width={44} mt={8} radius="sm" />
        </div>
        <div className={classes.stat}>
          <Skeleton height={8} width={60} radius="sm" />
          <Skeleton height={24} width={50} mt={8} radius="sm" />
          <Skeleton height={4} mt={8} radius="xl" />
        </div>
        <div className={classes.moves}>
          <Skeleton height={34} radius="md" />
          <Skeleton height={34} radius="md" />
        </div>
      </section>

      <div className={classes.workspace}>
        <RailSkeleton />
        <DetailSkeleton />
      </div>
    </>
  );
}
