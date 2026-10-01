import { Skeleton } from "@mantine/core";
import classes from "./Members.module.css";

export function MembersSkeleton() {
  return (
    <>
      <section className={classes.overview}>
        <div className={classes.headcount}>
          <Skeleton height={42} width={96} radius="xl" />
          <div>
            <Skeleton height={26} width={190} radius="sm" />
            <Skeleton height={10} width={130} mt={10} radius="sm" />
          </div>
        </div>
        <div className={classes.breakdown}>
          <Skeleton height={30} width={86} radius="xl" />
          <Skeleton height={30} width={86} radius="xl" />
        </div>
        <div className={classes.access}>
          <Skeleton height={40} width={40} radius={12} />
          <div>
            <Skeleton height={8} width={70} radius="sm" />
            <Skeleton height={13} width={60} mt={8} radius="sm" />
            <Skeleton height={9} width={90} mt={8} radius="sm" />
          </div>
        </div>
      </section>

      <div className={classes.toolbar}>
        <Skeleton height={36} width={250} radius="md" />
        <Skeleton className={classes.search} height={36} radius="md" />
      </div>

      <div className={classes.table}>
        <div className={`${classes.grid} ${classes.head}`}>
          <Skeleton height={9} width={50} radius="sm" />
          <Skeleton height={9} width={32} radius="sm" />
          <Skeleton className={classes.colJoined} height={9} width={40} radius="sm" />
          <span />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${classes.grid} ${classes.row}`}>
            <div className={classes.member}>
              <Skeleton height={34} width={34} circle />
              <div className={classes.skelMember}>
                <Skeleton height={11} width={`${38 - i * 5}%`} radius="sm" />
                <Skeleton height={9} width={`${55 - i * 6}%`} radius="sm" />
              </div>
            </div>
            <Skeleton height={11} width={64} radius="sm" />
            <Skeleton className={classes.colJoined} height={10} width={80} radius="sm" />
            <Skeleton height={24} width={24} radius="md" />
          </div>
        ))}
      </div>
    </>
  );
}
