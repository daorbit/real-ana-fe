import { UnstyledButton } from "@mantine/core";
import { TREND_METRICS, TREND_SERIES, type TrendMetric } from "@/features/analytics/lib/trafficSeries";
import classes from "@/features/analytics/components/trend/TrafficTrend.module.css";

export function TrafficTrendLegend({
  focus,
  onFocus,
  comparing,
}: {
  focus: TrendMetric | null;
  onFocus: (metric: TrendMetric) => void;
  comparing: boolean;
}) {
  return (
    <div className={classes.legend}>
      {TREND_METRICS.map((metric) => (
        <UnstyledButton
          key={metric}
          className={`${classes.legendItem} ${classes.legendButton}`}
          data-dim={(focus && focus !== metric) || undefined}
          aria-pressed={focus === metric}
          onClick={() => onFocus(metric)}
        >
          <span className={classes.dot} data-metric={metric} />
          {TREND_SERIES[metric].label}
        </UnstyledButton>
      ))}
      {comparing && (
        <span className={classes.legendItem}>
          <span className={classes.dot} data-metric="baseline" />
          Baseline
        </span>
      )}
    </div>
  );
}
