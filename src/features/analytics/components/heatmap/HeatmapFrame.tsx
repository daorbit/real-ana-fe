import { useHeatCanvas } from "@/features/analytics/hooks/useHeatCanvas";
import { HeatmapPageOutline } from "@/features/analytics/components/heatmap/HeatmapPageOutline";
import type { PageHeatmap } from "@/shared/types";
import classes from "@/features/analytics/components/heatmap/PageHeatmap.module.css";

function pageTitle(path: string) {
  const last = path.split("/").filter(Boolean).pop();
  if (!last) return "Home";
  const words = last.replace(/[-_]+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function HeatmapFrame({ heatmap, host }: { heatmap: PageHeatmap; host?: string }) {
  const { frameRef, canvasRef } = useHeatCanvas(heatmap.cells, heatmap.grid);

  return (
    <div className={classes.browser} data-device={heatmap.device}>
      <div className={classes.browserBar} aria-hidden>
        <span className={classes.browserDot} />
        <span className={classes.browserDot} />
        <span className={classes.browserDot} />
        <span className={classes.browserUrl}>
          {host ?? ""}
          {heatmap.path}
        </span>
      </div>
      <div ref={frameRef} className={classes.frame} data-device={heatmap.device}>
        <HeatmapPageOutline title={pageTitle(heatmap.path)} />
        <canvas ref={canvasRef} className={classes.canvas} aria-label={`Click heatmap for ${heatmap.path}`} />
        {heatmap.clicks === 0 && <div className={classes.frameEmpty}>No clicks recorded on this page yet.</div>}
      </div>
    </div>
  );
}
