import { LayoutThumb } from "@/features/dashboards/components/LayoutThumb";
import type { Placed } from "@/features/analytics/widgetCatalog";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export function MiniWindow({
  layout,
  title,
  size = "sm",
  revealed,
  limit,
}: {
  layout: Placed[];
  title?: string;
  size?: "sm" | "lg";
  revealed?: number;
  limit?: number;
}) {
  return (
    <div className={classes.stage} data-size={size}>
      <div className={classes.window}>
        <div className={classes.windowBar}>
          <span className={classes.windowDots}><i /><i /><i /></span>
          {title && <span className={classes.windowTitle}>{title}</span>}
        </div>
        <div className={classes.windowBody}>
          <LayoutThumb layout={layout} revealed={revealed} limit={limit} />
        </div>
      </div>
    </div>
  );
}
