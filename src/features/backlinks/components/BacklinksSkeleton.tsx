import { Skeleton } from "@mantine/core";
import classes from "./Backlinks.module.css";

export function BacklinksSkeleton() {
  return (
    <>
      <section className={classes.summary}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={classes.stat}>
            <Skeleton height={8} width={80} radius="sm" />
            <Skeleton height={24} width={56} mt={10} radius="sm" />
            <Skeleton height={9} width="70%" mt={8} radius="sm" />
          </div>
        ))}
      </section>
      <div className={classes.tabbar}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={12} width={100} my={14} mr={18} radius="sm" />
        ))}
      </div>
      <section className={classes.card}>
        <Skeleton height={13} width={180} radius="sm" />
        <Skeleton height={36} width="50%" mt={18} radius="md" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={classes.source}>
            <Skeleton height={18} width={18} mt={18} radius="sm" />
            <div className={classes.skelLines}>
              <Skeleton height={11} width={`${70 - i * 6}%`} mt={18} radius="sm" />
              <Skeleton height={9} width="40%" radius="sm" />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
