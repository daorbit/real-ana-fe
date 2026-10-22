import { num } from "@/shared/lib";
import { percentChange } from "@/shared/lib/metricChange";
import {
  TREND_SERIES, changeFrom, type TrendMetric, type TrendPoint,
} from "@/features/analytics/lib/trafficSeries";
import classes from "@/features/analytics/components/trend/TrafficTrend.module.css";

export function TrafficTrendTooltip({
  active,
  payload,
  label,
  metrics,
  comparing,
}: {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
  label?: string;
  metrics: TrendMetric[];
  comparing: boolean;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  return (
    <div className={classes.tip}>
      <div className={classes.tipHead}>
        <span>{label}</span>
        {comparing && row.compareBucket && <span>vs {row.compareBucket}</span>}
      </div>
      {metrics.map((metric) => {
        const series = TREND_SERIES[metric];
        const current = row[metric] ?? 0;
        const previous = row[series.compareKey];
        const change = comparing && previous !== undefined ? percentChange(changeFrom(previous, current)) : null;
        return (
          <div key={metric} className={classes.tipRow}>
            <span className={classes.dot} data-metric={metric} />
            <span className={classes.tipLabel}>{series.label}</span>
            <span className={classes.tipValue}>{num(current)}</span>
            {comparing && previous !== undefined && (
              <>
                <span className={classes.tipPrev}>/ {num(previous)}</span>
                <span
                  className={classes.change}
                  data-bad={(change && !change.good) || undefined}
                  data-flat={!change || change.flat || undefined}
                >
                  {change?.text ?? "new"}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
