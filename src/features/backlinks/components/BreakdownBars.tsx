import type { CSSProperties } from "react";
import { share } from "@/shared/lib/format";
import classes from "./Backlinks.module.css";

export function BreakdownBars({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  return (
    <div>
      <h4 className={classes.breakdownTitle}>{title}</h4>
      {rows.map((r) => {
        const pct = share(r.value, total);
        return (
          <div key={r.label} className={classes.barRow}>
            <span className={classes.barLabel}>{r.label}</span>
            <span className={classes.barTrack}>
              <span className={classes.barFill} style={{ "--share": pct } as CSSProperties} />
            </span>
            <span className={classes.barValue}>{pct}</span>
          </div>
        );
      })}
    </div>
  );
}
