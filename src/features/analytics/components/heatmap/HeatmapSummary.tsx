import { num } from "@/shared/lib";
import { halfwayDepth } from "@/features/analytics/lib/heatmapDraw";
import type { PageHeatmap } from "@/shared/types";
import classes from "@/features/analytics/components/heatmap/PageHeatmap.module.css";

export function HeatmapSummary({ heatmap }: { heatmap: PageHeatmap }) {
  const halfway = heatmap.scroll.sessions > 0 ? halfwayDepth(heatmap.scroll.reach) : null;

  return (
    <div className={classes.summary}>
      <div className={classes.stat}>
        <span className={classes.statLabel}>Clicks</span>
        <span className={classes.statValue}>{num(heatmap.clicks)}</span>
      </div>
      <div className={classes.stat}>
        <span className={classes.statLabel}>Visitors who scrolled</span>
        <span className={classes.statValue}>{num(heatmap.scroll.sessions)}</span>
      </div>
      <div className={classes.stat}>
        <span className={classes.statLabel}>Half drop off by</span>
        <span className={classes.statValue}>{halfway === null ? "—" : `${halfway}%`}</span>
      </div>
    </div>
  );
}
