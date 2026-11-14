import { MetricTile } from "@/shared/ui/MetricTile";
import { BIO_METRICS, metricChange, metricTotals, type BioChartPoint, type BioMetricKey } from "@/features/bio/lib/bioMetrics";
import type { BioPageStatsDetail } from "@/features/bio/types";
import classes from "./BioStats.module.css";

export function BioMetricTiles({
  stats,
  points,
  selected,
  onToggle,
}: {
  stats: BioPageStatsDetail;
  points: BioChartPoint[];
  selected: BioMetricKey[];
  onToggle: (key: BioMetricKey) => void;
}) {
  const totals = metricTotals(stats);

  return (
    <div className={classes.tiles} role="group" aria-label="Chart metrics">
      {BIO_METRICS.map((m) => (
        <MetricTile
          key={m.key}
          id={m.key}
          label={m.label}
          color={m.color}
          value={m.format(totals[m.key])}
          change={metricChange(m.key, stats)}
          spark={points}
          sparkKey={m.key}
          hint={m.hint}
          active={selected.includes(m.key)}
          onToggle={() => onToggle(m.key)}
        />
      ))}
    </div>
  );
}
