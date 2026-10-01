import { Lightbulb } from "lucide-react";
import { num } from "@/shared/lib";
import { SearchWidgetNotice } from "@/features/searchConsole/widgets/SearchWidgetNotice";
import { SearchWidgetCard, SearchWidgetSkeleton } from "@/features/searchConsole/widgets/SearchWidgetCard";
import { SearchRowList } from "@/features/searchConsole/widgets/SearchRowList";
import { useSearchInsightsData } from "@/features/searchConsole/widgets/useSearchWidgetData";
import type { SearchListRow } from "@/features/searchConsole/widgets/SearchRowList";
import type { SearchSource } from "@/features/searchConsole/widgets/useSearchWidgetSource";

const LIMIT = 5;

export function SearchOpportunitiesWidget({ source }: { source: SearchSource }) {
  const { data, loading, failure, retry } = useSearchInsightsData(source);
  const ready = source.kind === "ready" && data && !failure;

  const rows: SearchListRow[] = ready
    ? data.quickWins.slice(0, LIMIT).map((q) => ({
        key: q.key,
        label: q.key,
        sub: q.missedClicks ? `≈ ${num(Math.round(q.missedClicks))} more clicks on page one` : undefined,
        value: q.impressions,
        position: q.position,
      }))
    : [];

  return (
    <SearchWidgetCard
      icon={Lightbulb}
      title="Quick wins"
      subtitle={ready ? "Queries just off page one" : undefined}
      tab="insights"
    >
      {source.kind === "loading" || loading ? (
        <SearchWidgetSkeleton lines={5} />
      ) : !ready ? (
        <SearchWidgetNotice source={source} failure={failure} onRetry={retry} />
      ) : rows.length === 0 ? (
        <SearchWidgetNotice empty emptyTitle="No quick wins right now" emptyText="Nothing is sitting just off page one. Check back as rankings move." />
      ) : (
        <SearchRowList rows={rows} labelHeader="Query" valueHeader="Impr." />
      )}
    </SearchWidgetCard>
  );
}
