import { useState } from "react";
import { Text } from "@mantine/core";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import dayjs from "dayjs";
import type { SearchPerformance } from "@/shared/types";
import { METRICS, metricChange, pagePath, type MetricKey } from "../searchMetrics";
import { SearchPerformanceChart } from "./SearchPerformanceChart";
import { SearchTopTable } from "./SearchTopTable";
import type { DrillTarget } from "./SearchDrilldownDrawer";
import classes from "./searchConsole.module.css";

export function SearchOverviewTab({
  data,
  onViewQueries,
  onViewPages,
  onOpen,
}: {
  data: SearchPerformance;
  onViewQueries: () => void;
  onViewPages: () => void;
  onOpen: (target: DrillTarget) => void;
}) {
  const [metricKey, setMetricKey] = useState<MetricKey>("clicks");
  const metric = METRICS.find((m) => m.key === metricKey) ?? METRICS[0];

  return (
    <div className={classes.section}>
      <div className={classes.tiles} role="group" aria-label="Chart metric">
        {METRICS.map((m) => {
          const change = metricChange(m, data.totals[m.key], data.previous?.[m.key]);
          return (
            <button
              key={m.key}
              type="button"
              className={classes.tile}
              data-active={m.key === metricKey || undefined}
              aria-pressed={m.key === metricKey}
              onClick={() => setMetricKey(m.key)}
            >
              <span className={classes.tileLabel}>{m.label}</span>
              <span className={classes.tileValue}>{m.format(data.totals[m.key])}</span>
              {change ? (
                <span className={classes.change} data-good={change.good || undefined} data-flat={change.flat || undefined}>
                  {!change.flat && (change.good ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
                  {change.text} vs previous
                </span>
              ) : (
                <span className={classes.tileLabel}>No earlier data</span>
              )}
            </button>
          );
        })}
      </div>

      <div className={classes.card}>
        <div className={classes.cardHead}>
          <div>
            <Text fw={650} size="sm">
              {metric.label} per day
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {dayjs(data.startDate).format("MMM D")} – {dayjs(data.endDate).format("MMM D, YYYY")}. Google's
              numbers settle over 2–3 days, so the latest days may still rise.
            </Text>
          </div>
        </div>
        {data.daily.length ? (
          <SearchPerformanceChart daily={data.daily} metric={metric} />
        ) : (
          <Text size="sm" c="dimmed">
            No search data for this period yet. New properties take a few days to fill in.
          </Text>
        )}
      </div>

      <div className={classes.tables}>
        <SearchTopTable
          title="Top queries"
          description="What people searched before clicking or seeing your site."
          labelHeader="Query"
          rows={data.queries.map((q) => ({ ...q, label: q.query }))}
          emptyText="No queries recorded for this period."
          onViewAll={onViewQueries}
          onOpenRow={(row) => onOpen({ dimension: "query", value: row.label })}
        />
        <SearchTopTable
          title="Top pages"
          description="Your pages that appeared in Google results."
          labelHeader="Page"
          rows={data.pages.map((p) => ({ ...p, label: pagePath(p.page), href: p.page }))}
          emptyText="No pages recorded for this period."
          onViewAll={onViewPages}
          onOpenRow={(row) => row.href && onOpen({ dimension: "page", value: row.href })}
        />
      </div>
    </div>
  );
}
