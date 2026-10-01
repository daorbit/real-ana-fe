import { num } from "@/shared/lib";
import { positionTone } from "@/features/searchConsole/searchMetrics";
import classes from "@/features/searchConsole/widgets/searchWidgets.module.css";

export type SearchListRow = {
  key: string;
  label: string;
  sub?: string;
  value: number;
  position: number;
};

export function SearchRowList({ rows, labelHeader, valueHeader }: { rows: SearchListRow[]; labelHeader: string; valueHeader: string }) {
  return (
    <div className={classes.rows}>
      <div className={classes.rowsHead}>
        <span>{labelHeader}</span>
        <span className={classes.num}>{valueHeader}</span>
        <span className={classes.num}>Pos.</span>
      </div>
      {rows.map((r) => (
        <div key={r.key} className={classes.row}>
          <span className={classes.rowLabel} title={r.key}>
            {r.label}
            {r.sub && <span className={classes.rowSub}>{r.sub}</span>}
          </span>
          <span className={classes.num}>{num(Math.round(r.value))}</span>
          <span className={classes.position} data-tone={positionTone(r.position)}>
            {r.position ? r.position.toFixed(1) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
