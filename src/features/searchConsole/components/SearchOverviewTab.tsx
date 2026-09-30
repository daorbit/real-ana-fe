import { useState, type ReactNode } from "react";
import { Text } from "@mantine/core";
import dayjs from "dayjs";
import type { SearchPerformance } from "@/shared/types";
import { METRIC_BY_KEY, metricChange, pagePath, type MetricKey } from "../searchMetrics";
import { SearchMetricTiles, toggleMetric } from "./SearchMetricTiles";
import type { ExplainProps } from "../useSearchOrbitExplain";
import { SearchPerformanceChart } from "./SearchPerformanceChart";
import { MetricLegend } from "./MetricLegend";
import { SearchTopTable } from "./SearchTopTable";
import classes from "./searchConsole.module.css";

function plural(n: number, word: string) {
  return `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;
}

function Headline({ data }: { data: SearchPerformance }) {
  const { totals, previous, days } = data;
  const clicks = Math.round(totals.clicks);
  const impressions = Math.round(totals.impressions);
  const change = metricChange(METRIC_BY_KEY.clicks, totals.clicks, previous?.clicks);
  const ranking = totals.position
    ? totals.position <= 10
      ? `on page one (average position ${totals.position.toFixed(1)})`
      : `beyond page one (average position ${totals.position.toFixed(1)})`
    : null;

  return (
    <div className={classes.headline}>
      <div className={classes.headlineText}>
        <p className={classes.headlineTitle}>
          In the last {days} days, Google showed your site <b>{plural(impressions, "time")}</b> and{" "}
          <b>{clicks === 1 ? "1 person" : `${clicks.toLocaleString()} people`}</b> clicked through.
        </p>
        <p className={classes.headlineSub}>
          {change && !change.flat && (
            <>
              Clicks are{" "}
              <span className={change.good ? classes.headlineUp : classes.headlineDown}>
                {change.good ? "up" : "down"} {change.text.replace(/^[+−]/, "")}
              </span>{" "}
              on the previous {days} days.{" "}
            </>
          )}
          {ranking && <>You typically rank {ranking}.</>}
        </p>
      </div>
    </div>
  );
}

export function SearchOverviewTab({
  data,
  onViewQueries,
  onViewPages,
  onOpenQuery,
  onOpenPage,
  explain,
  hasQueries = true,
  hourly,
}: {
  data: SearchPerformance;
  hasQueries?: boolean;
  hourly?: ReactNode;
  onViewQueries: () => void;
  onViewPages: () => void;
  onOpenQuery: (query: string) => void;
  onOpenPage: (url: string) => void;
  explain?: (key: MetricKey) => ExplainProps;
}) {
  const [selected, setSelected] = useState<MetricKey[]>(["clicks", "impressions"]);

  return (
    <div className={classes.section}>
      <Headline data={data} />
      <SearchMetricTiles
        explain={explain}
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
              {dayjs(data.startDate).format("MMM D")} – {dayjs(data.endDate).format("MMM D, YYYY")} · Tap a card
              above to show or hide it. The last 2–3 days can still rise.
            </Text>
          </div>
          <MetricLegend selected={selected} />
        </div>
        {data.daily.length ? (
          <SearchPerformanceChart daily={data.daily} selected={selected} />
        ) : (
          <Text size="sm" c="dimmed">
            No search data for this period yet. New properties take a few days to fill in.
          </Text>
        )}
      </div>

      {hourly}

      <div className={classes.tables} data-single={!hasQueries || undefined}>
        {hasQueries && (
          <SearchTopTable
            title="Top queries"
            description="What people searched before seeing your site."
            labelHeader="Query"
            rows={data.queries.map((q) => ({ ...q, key: q.query, label: q.query }))}
            emptyText="No queries recorded for this period."
            onViewAll={onViewQueries}
            onOpenRow={(row) => onOpenQuery(row.key)}
          />
        )}
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
