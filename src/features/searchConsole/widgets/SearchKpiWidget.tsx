import { Card } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import { StatCard } from "@/shared/ui/StatCard";
import { METRIC_BY_KEY, percentDelta, type MetricKey } from "@/features/searchConsole/searchMetrics";
import { SearchWidgetNotice } from "@/features/searchConsole/widgets/SearchWidgetNotice";
import { SearchWidgetSkeleton } from "@/features/searchConsole/widgets/SearchWidgetCard";
import { useSearchPerformanceData } from "@/features/searchConsole/widgets/useSearchWidgetData";
import type { SearchSource } from "@/features/searchConsole/widgets/useSearchWidgetSource";
import classes from "@/features/searchConsole/widgets/searchWidgets.module.css";

const HINTS: Record<MetricKey, string> = {
  clicks: "Clicks from Google Search results to your site. Google's data runs 2–3 days behind.",
  impressions: "How many times your pages appeared in Google results.",
  ctr: "The share of impressions that turned into a click.",
  position: "Your average ranking in Google results. Lower is better.",
};

export function SearchKpiWidget({
  metric,
  label,
  icon,
  source,
}: {
  metric: MetricKey;
  label: string;
  icon: LucideIcon;
  source: SearchSource;
}) {
  const { data, loading, failure, retry } = useSearchPerformanceData(source);
  const def = METRIC_BY_KEY[metric];
  const Icon = icon;

  if (source.kind === "ready" && data && !failure) {
    const current = data.totals[metric];
    return (
      <StatCard
        icon={icon}
        label={label}
        value={def.format(current)}
        color={def.tone}
        delta={percentDelta(current, data.previous?.[metric])}
        inverseDelta={def.lowerIsBetter}
        spark={data.daily}
        sparkKey={metric}
        hint={`${HINTS[metric]} Last ${data.days} days.`}
      />
    );
  }

  const busy = source.kind === "loading" || loading;

  return (
    <Card withBorder radius="lg" padding="lg" className={classes.card}>
      <div className={classes.kpiHead}>
        <Icon size={15} className="sect-ic" />
        {label}
      </div>
      {busy ? (
        <SearchWidgetSkeleton lines={2} />
      ) : (
        <SearchWidgetNotice compact source={source} failure={failure} onRetry={retry} />
      )}
    </Card>
  );
}
