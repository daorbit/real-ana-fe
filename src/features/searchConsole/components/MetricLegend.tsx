import type { CSSProperties } from "react";
import { METRICS, type MetricKey } from "../searchMetrics";
import classes from "./metrics.module.css";

export function MetricLegend({ selected }: { selected: MetricKey[] }) {
  return (
    <div className={classes.legend} aria-label="Chart legend">
      {METRICS.filter((m) => selected.includes(m.key)).map((m) => (
        <span key={m.key} className={classes.legendItem} style={{ "--metric": m.color } as CSSProperties}>
          <span className={classes.legendLine} aria-hidden />
          {m.short}
        </span>
      ))}
    </div>
  );
}
