import { StatCardSkeleton, ChartSkeleton, ListSkeleton, PanelSkeleton } from "@/shared/ui/Skeletons";
import classes from "@/features/dashboards/components/studio/Studio.module.css";

export function PreviewSkeleton() {
  return (
    <div className={classes.skeletonGrid} aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} spark={false} />
      ))}
      <div className={classes.skWide}>
        <ChartSkeleton height={190} />
      </div>
      <ListSkeleton rows={4} aside={false} />
      <PanelSkeleton className={classes.skHalf} height={240} />
      <PanelSkeleton className={classes.skHalf} height={240} />
    </div>
  );
}
