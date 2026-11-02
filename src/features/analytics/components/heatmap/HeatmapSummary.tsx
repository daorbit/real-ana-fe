import { num } from "@/shared/lib";
import type { PageHeatmap } from "@/shared/types";
import classes from "@/features/analytics/components/heatmap/PageHeatmap.module.css";

export function HeatmapSummary({ heatmap, visits }: { heatmap: PageHeatmap; visits: number }) {
  return (
    <div className={classes.summary}>
      <div className={classes.stat}>
        <span className={classes.statLabel}>Clicks</span>
        <span className={classes.statValue}>{num(heatmap.clicks)}</span>
      </div>
      <div className={classes.stat}>
        <span className={classes.statLabel}>Visits</span>
        <span className={classes.statValue}>{num(visits)}</span>
      </div>
    </div>
  );
}
