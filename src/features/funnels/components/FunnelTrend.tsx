import { num } from "@/shared/lib";
import type { FunnelTrendPoint, FunnelTrendUnit } from "@/shared/types";
import { percentLabel, trendTickLabel, trendUnitLabel } from "../lib/funnelFormat";
import classes from "./FunnelResults.module.css";

const MAX_TICKS = 8;
const MIN_SESSIONS_FOR_DIP = 10;

export function FunnelTrend({ points, unit }: { points: FunnelTrendPoint[]; unit: FunnelTrendUnit }) {
  if (points.length < 2) return null;

  const peak = Math.max(...points.map((p) => p.conversion), 1);
  const active = points.filter((p) => p.entered >= MIN_SESSIONS_FOR_DIP);
  const average = active.length ? active.reduce((sum, p) => sum + p.conversion, 0) / active.length : 0;
  const tickEvery = Math.ceil(points.length / MAX_TICKS);

  return (
    <section className={classes.trend} aria-labelledby="funnel-trend-title">
      <div className={classes.trendHead}>
        <h3 id="funnel-trend-title" className={classes.trendTitle}>
          Conversion over time
        </h3>
        <span className={classes.trendSub}>
          First step to last, {trendUnitLabel(unit)}, by when visitors entered. Sudden dips usually mean a release or an outage.
        </span>
      </div>
      <ol className={classes.trendBars}>
        {points.map((point, i) => {
          const dip = point.entered >= MIN_SESSIONS_FOR_DIP && average > 0 && point.conversion < average * 0.5;
          const height = point.entered === 0 ? 0 : Math.max((point.conversion / peak) * 100, 2);
          const label = trendTickLabel(point.at, unit);
          return (
            <li
              key={point.at}
              className={classes.trendBar}
              title={`${label}: ${percentLabel(point.conversion)} (${num(point.completed)} of ${num(point.entered)} sessions)`}
            >
              <svg viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden className={classes.trendSvg}>
                {height > 0 && (
                  <rect className={classes.trendRect} data-dip={dip || undefined} x="0" y={100 - height} width="10" height={height} />
                )}
              </svg>
              <span className={classes.trendTick} data-hidden={i % tickEvery !== 0 || undefined}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
