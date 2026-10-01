import { TrendingUp } from "lucide-react";
import dayjs from "dayjs";
import { METRIC_BY_KEY, type MetricKey } from "@/features/searchConsole/searchMetrics";
import { SearchPerformanceChart } from "@/features/searchConsole/components/SearchPerformanceChart";
import { MetricLegend } from "@/features/searchConsole/components/MetricLegend";
import { SearchWidgetNotice } from "@/features/searchConsole/widgets/SearchWidgetNotice";
import { SearchWidgetCard, SearchWidgetSkeleton } from "@/features/searchConsole/widgets/SearchWidgetCard";
import { useSearchPerformanceData } from "@/features/searchConsole/widgets/useSearchWidgetData";
import type { SearchSource } from "@/features/searchConsole/widgets/useSearchWidgetSource";
import classes from "@/features/searchConsole/widgets/searchWidgets.module.css";

const SHOWN: MetricKey[] = ["clicks", "impressions"];

export function SearchTrendWidget({ source }: { source: SearchSource }) {
  const { data, loading, failure, retry } = useSearchPerformanceData(source);
  const ready = source.kind === "ready" && data && !failure;
  const subtitle = ready
    ? `${dayjs(data.startDate).format("MMM D")} – ${dayjs(data.endDate).format("MMM D")} · ${source.siteName}`
    : undefined;

  return (
    <SearchWidgetCard icon={TrendingUp} title="Search performance" subtitle={subtitle}>
      {source.kind === "loading" || loading ? (
        <SearchWidgetSkeleton lines={5} />
      ) : !ready ? (
        <SearchWidgetNotice source={source} failure={failure} onRetry={retry} />
      ) : data.daily.length === 0 ? (
        <SearchWidgetNotice empty />
      ) : (
        <>
          <div className={classes.trendHead}>
            <div className={classes.trendTotals}>
              {SHOWN.map((key) => (
                <div key={key} className={classes.trendTotal}>
                  <span className={classes.trendValue}>{METRIC_BY_KEY[key].format(data.totals[key])}</span>
                  <span className={classes.trendLabel}>{METRIC_BY_KEY[key].label}</span>
                </div>
              ))}
            </div>
            <MetricLegend selected={SHOWN} />
          </div>
          <div className={classes.trendChart}>
            <SearchPerformanceChart daily={data.daily} selected={SHOWN} />
          </div>
        </>
      )}
    </SearchWidgetCard>
  );
}
