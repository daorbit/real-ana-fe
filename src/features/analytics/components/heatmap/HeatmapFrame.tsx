import { useHeatCanvas } from "@/features/analytics/hooks/useHeatCanvas";
import { reachLevel } from "@/features/analytics/lib/heatmapDraw";
import type { PageHeatmap } from "@/shared/types";
import classes from "@/features/analytics/components/heatmap/PageHeatmap.module.css";

const BAND_COUNT = 10;
const BANDS = Array.from({ length: BAND_COUNT }, (_, i) => i);

export function HeatmapFrame({ heatmap }: { heatmap: PageHeatmap }) {
  const { frameRef, canvasRef } = useHeatCanvas(heatmap.cells, heatmap.grid);
  const reach = heatmap.scroll.reach;
  const hasReach = reach.length === BAND_COUNT && heatmap.scroll.sessions > 0;

  return (
    <div className={classes.viewer}>
      <div ref={frameRef} className={classes.frame} data-device={heatmap.device}>
        <div className={classes.bands} aria-hidden>
          {BANDS.map((band) => (
            <div
              key={band}
              className={classes.band}
              data-level={hasReach ? reachLevel(reach[band]) : undefined}
            />
          ))}
        </div>
        <canvas ref={canvasRef} className={classes.canvas} aria-label={`Click heatmap for ${heatmap.path}`} />
        {heatmap.clicks === 0 && <div className={classes.frameEmpty}>No clicks recorded on this page yet.</div>}
      </div>
      {hasReach && (
        <div className={classes.rail} aria-label="Share of visitors who scrolled this far">
          {BANDS.map((band) => (
            <span key={band} className={classes.railStep} data-level={reachLevel(reach[band])}>
              {reach[band]}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
