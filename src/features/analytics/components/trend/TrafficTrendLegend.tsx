import { SegmentedControl } from "@mantine/core";
import { TREND_SERIES, type TrendMetric } from "@/features/analytics/lib/trafficSeries";
import classes from "@/features/analytics/components/trend/TrafficTrend.module.css";

const METRIC_ORDER: TrendMetric[] = ["visitors", "views"];

export function TrafficMetricSwitch({
  value,
  onChange,
}: {
  value: TrendMetric;
  onChange: (metric: TrendMetric) => void;
}) {
  return (
    <SegmentedControl
      size="xs"
      value={value}
      onChange={(v) => onChange(v as TrendMetric)}
      data={METRIC_ORDER.map((metric) => ({ value: metric, label: TREND_SERIES[metric].label }))}
      aria-label="Chart metric"
    />
  );
}

export function TrafficPeriodLegend({
  metric,
  comparing,
  baselineLabel,
}: {
  metric: TrendMetric;
  comparing: boolean;
  baselineLabel: string;
}) {
  return (
    <div className={classes.periods}>
      <span className={classes.period}>
        <span className={classes.line} data-metric={metric} aria-hidden />
        This period
      </span>
      {comparing && (
        <span className={classes.period}>
          <span className={classes.line} data-metric="baseline" aria-hidden />
          {baselineLabel}
        </span>
      )}
    </div>
  );
}
