import { Skeleton } from "@mantine/core";
import classes from "./Compare.module.css";

export function CompareSkeleton() {
  return (
    <>
      <section className={classes.banner}>
        <div>
          <Skeleton height={30} width={90} radius="sm" />
          <Skeleton height={10} width={180} mt={10} radius="sm" />
        </div>
        <div className={classes.stat}>
          <Skeleton height={8} width={70} radius="sm" />
          <Skeleton height={22} width={44} mt={8} radius="sm" />
        </div>
        <div className={classes.stat}>
          <Skeleton height={8} width={60} radius="sm" />
          <Skeleton height={22} width={50} mt={8} radius="sm" />
        </div>
        <div className={classes.moves}>
          <Skeleton height={12} width={220} radius="sm" />
        </div>
      </section>

      <div className={classes.workspace}>
        <div className={classes.panel}>
          <div className={classes.railHead}>
            <Skeleton height={12} width={90} radius="sm" />
            <Skeleton height={10} width={30} radius="sm" />
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
          </div>
          <div className={classes.list}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={classes.item}>
                <Skeleton height={18} width={18} radius="sm" />
                <div className={classes.skelLines}>
                  <Skeleton height={11} width={`${70 - i * 8}%`} radius="sm" />
                  <Skeleton height={9} width="40%" radius="sm" />
                </div>
                <Skeleton height={12} width={24} radius="sm" />
              </div>
            ))}
          </div>
        </div>

        <div className={classes.detail}>
          <section className={classes.card}>
            <div className={classes.identity}>
              <Skeleton height={42} width={42} radius={12} />
              <div className={classes.skelLines}>
                <Skeleton height={16} width={160} radius="sm" />
                <Skeleton height={10} width={220} radius="sm" />
              </div>
            </div>
            <div className={classes.scoreboard}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={classes.scoreCell}>
                  <Skeleton height={9} width="50%" radius="sm" />
                  <Skeleton height={24} width={50} mt={10} radius="sm" />
                </div>
              ))}
            </div>
          </section>
          <section className={classes.card}>
            <Skeleton height={13} width={180} radius="sm" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={11} width={`${88 - i * 10}%`} mt={16} radius="sm" />
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
