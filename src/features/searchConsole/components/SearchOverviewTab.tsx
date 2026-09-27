import { useState } from "react";
import { Text } from "@mantine/core";
import dayjs from "dayjs";
import type { SearchPerformance } from "@/shared/types";
import { pagePath, type MetricKey } from "../searchMetrics";
import { SearchMetricTiles, toggleMetric } from "./SearchMetricTiles";
import { SearchPerformanceChart } from "./SearchPerformanceChart";
import { SearchTopTable } from "./SearchTopTable";
import classes from "./searchConsole.module.css";

export function SearchOverviewTab({
  data,
  onViewQueries,
  onViewPages,
  onOpenQuery,
  onOpenPage,
}: {
  data: SearchPerformance;
  onViewQueries: () => void;
  onViewPages: () => void;
  onOpenQuery: (query: string) => void;
  onOpenPage: (url: string) => void;
}) {
  const [selected, setSelected] = useState<MetricKey[]>(["clicks", "impressions"]);

  return (
    <div className={classes.section}>
      <SearchMetricTiles
        totals={data.totals}
        previous={data.previous}
        daily={data.daily}
        selected={selected}
        onToggle={(key) => setSelected((s) => toggleMetric(s, key))}
      />

      <div className={classes.card}>
        <div className={classes.cardHead}>
          <div>
            <Text fw={650} size="sm">
              Performance over time
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {dayjs(data.startDate).format("MMM D")} – {dayjs(data.endDate).format("MMM D, YYYY")} · Select the
              cards above to compare metrics. The latest 2–3 days may still rise as Google finalises data.
            </Text>
          </div>
        </div>
        {data.daily.length ? (
          <SearchPerformanceChart daily={data.daily} selected={selected} />
        ) : (
          <Text size="sm" c="dimmed">
            No search data for this period yet. New properties take a few days to fill in.
          </Text>
        )}
      </div>

      <div className={classes.tables}>
        <SearchTopTable
          title="Top queries"
          description="What people searched before seeing your site."
          labelHeader="Query"
          rows={data.queries.map((q) => ({ ...q, key: q.query, label: q.query }))}
          emptyText="No queries recorded for this period."
          onViewAll={onViewQueries}
          onOpenRow={(row) => onOpenQuery(row.key)}
        />
        <SearchTopTable
          title="Top pages"
          description="Your pages that appeared in Google results."
          labelHeader="Page"
          rows={data.pages.map((p) => ({ ...p, key: p.page, label: pagePath(p.page) }))}
          emptyText="No pages recorded for this period."
          onViewAll={onViewPages}
          onOpenRow={(row) => onOpenPage(row.key)}
        />
      </div>
    </div>
  );
}
