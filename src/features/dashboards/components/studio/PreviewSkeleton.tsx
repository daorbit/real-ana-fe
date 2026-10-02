import { Skeleton } from "@mantine/core";
import classes from "@/features/dashboards/components/studio/Studio.module.css";

export function PreviewSkeleton() {
  return (
    <div className={classes.skeletonGrid} aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} height={112} radius="lg" />
      ))}
      <Skeleton className={classes.skWide} height={300} radius="lg" />
      <Skeleton height={300} radius="lg" />
      <Skeleton className={classes.skHalf} height={240} radius="lg" />
      <Skeleton className={classes.skHalf} height={240} radius="lg" />
    </div>
  );
}
