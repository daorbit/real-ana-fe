import type { ReactNode } from "react";
import { Eye, Hash, MousePointerClick, Percent, type LucideIcon } from "lucide-react";
import type { SearchMetrics, SearchPerformance } from "@/shared/types";
import { METRICS, percentDelta, type MetricKey } from "../searchMetrics";
import { SelectableStat } from "./SelectableStat";
import type { ExplainProps } from "../useSearchOrbitExplain";
import classes from "./metrics.module.css";

const ICONS: Record<MetricKey, LucideIcon> = {
  clicks: MousePointerClick,
  impressions: Eye,
  ctr: Percent,
  position: Hash,
};

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
        <SelectableStat
          key={m.key}
          active={selected.includes(m.key)}
          onSelect={() => onToggle(m.key)}
          icon={ICONS[m.key]}
          label={m.label}
          value={m.key === "clicks" || m.key === "impressions" ? Math.round(totals[m.key]) : m.format(totals[m.key])}
          color={m.tone}
          delta={percentDelta(totals[m.key], previous?.[m.key])}
          inverseDelta={m.lowerIsBetter}
          spark={daily && daily.length > 1 ? daily : undefined}
          sparkKey={m.key}
          hint={HINTS[m.key]}
          {...explain?.(m.key)}
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
