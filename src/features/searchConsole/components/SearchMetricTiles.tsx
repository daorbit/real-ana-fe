import type { ReactNode } from "react";
import type { SearchMetrics, SearchPerformance } from "@/shared/types";
import { METRICS, metricChange, type MetricKey } from "../searchMetrics";
import { SearchMetricTile } from "./SearchMetricTile";
import type { ExplainProps } from "../useSearchOrbitExplain";
import classes from "./metrics.module.css";

const HINTS: Record<MetricKey, string> = {
  clicks: "How many times someone clicked through to your site from Google Search.",
  impressions: "How many times a link to your site appeared in someone's search results.",
  ctr: "Clicks divided by impressions — the share of people who saw your result and clicked it.",
  position: "Your average ranking in Google results. Lower is better; 1 is the top result.",
};

export function SearchMetricTiles({
  totals,
  previous,
  daily,
  selected,
  onToggle,
  columns = 4,
  children,
  explain,
}: {
  totals: SearchMetrics;
  previous: SearchMetrics | null;
  daily?: SearchPerformance["daily"];
  selected: MetricKey[];
  onToggle: (key: MetricKey) => void;
  columns?: 2 | 4 | 5;
  children?: ReactNode;
  explain?: (key: MetricKey) => ExplainProps;
}) {
  return (
    <div className={classes.tiles} data-columns={columns} role="group" aria-label="Chart metrics">
      {METRICS.map((m) => (
        <SearchMetricTile
          key={m.key}
          id={m.key}
          label={m.label}
          color={m.color}
          value={m.format(totals[m.key])}
          change={metricChange(m, totals[m.key], previous?.[m.key])}
          spark={daily}
          sparkKey={m.key}
          hint={HINTS[m.key]}
          active={selected.includes(m.key)}
          onToggle={() => onToggle(m.key)}
          explain={explain?.(m.key)}
        />
      ))}
      {children}
    </div>
  );
}

export function toggleMetric(selected: MetricKey[], key: MetricKey): MetricKey[] {
  if (!selected.includes(key)) return [...selected, key];
  return selected.length > 1 ? selected.filter((k) => k !== key) : selected;
}
