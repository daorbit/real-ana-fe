import type { ReactNode } from "react";
import { SERIES, type SeriesKey, type StateCounts } from "../../lib/charts";
import classes from "./Charts.module.css";

export function ChartCard({ title, wide, children }: { title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section className={`${classes.card} ${wide ? classes.wide : ""}`}>
      <header className={classes.cardHead}>
        <span className={classes.cardTitle}>{title}</span>
      </header>
      <div className={classes.cardBody}>{children}</div>
    </section>
  );
}

export function SeriesLegend({ counts }: { counts: StateCounts }) {
  return (
    <div className={classes.legend}>
      {SERIES.map((s) => (
        <span key={s.key} className={classes.legendItem}>
          <span className={classes.swatch} data-series={s.key} />
          {s.label}
          <span className={classes.legendCount}>{counts[s.key]}</span>
        </span>
      ))}
    </div>
  );
}

type TooltipEntry = { dataKey?: string | number; value?: number | string };

export function SeriesTooltip({ active, label, payload }: { active?: boolean; label?: string; payload?: TooltipEntry[] }) {
  if (!active || !payload?.length) return null;
  const values = new Map(payload.map((p) => [String(p.dataKey), Number(p.value ?? 0)]));
  return (
    <div className={classes.tooltip}>
      <div className={classes.tooltipTitle}>{label}</div>
      {[...SERIES].reverse().map((s) => (
        <div key={s.key} className={classes.tooltipRow}>
          <span className={classes.swatch} data-series={s.key as SeriesKey} />
          {s.label}
          <span className={classes.tooltipValue}>{values.get(s.key) ?? 0}</span>
        </div>
      ))}
    </div>
  );
}
