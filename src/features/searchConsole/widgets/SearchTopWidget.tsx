import { FileSearch, Search } from "lucide-react";
import { pagePath } from "@/features/searchConsole/searchMetrics";
import { SearchWidgetNotice } from "@/features/searchConsole/widgets/SearchWidgetNotice";
import { SearchWidgetCard, SearchWidgetSkeleton } from "@/features/searchConsole/widgets/SearchWidgetCard";
import { SearchRowList } from "@/features/searchConsole/widgets/SearchRowList";
import { useSearchPerformanceData } from "@/features/searchConsole/widgets/useSearchWidgetData";
import type { SearchListRow } from "@/features/searchConsole/widgets/SearchRowList";
import type { SearchSource } from "@/features/searchConsole/widgets/useSearchWidgetSource";

const LIMIT = 6;

const CONFIG = {
  query: { title: "Top search queries", icon: Search, tab: "queries", header: "Query" },
  page: { title: "Top pages in Google", icon: FileSearch, tab: "pages", header: "Page" },
} as const;

export function SearchTopWidget({ dimension, source }: { dimension: "query" | "page"; source: SearchSource }) {
  const { data, loading, failure, retry } = useSearchPerformanceData(source);
  const config = CONFIG[dimension];
  const ready = source.kind === "ready" && data && !failure;

  const rows: SearchListRow[] = !ready
    ? []
    : dimension === "query"
      ? data.queries.slice(0, LIMIT).map((q) => ({ key: q.query, label: q.query, value: q.clicks, position: q.position }))
      : data.pages.slice(0, LIMIT).map((p) => ({ key: p.page, label: pagePath(p.page), value: p.clicks, position: p.position }));

  return (
    <SearchWidgetCard
      icon={config.icon}
      title={config.title}
      subtitle={ready ? `Last ${data.days} days` : undefined}
      tab={config.tab}
    >
      {source.kind === "loading" || loading ? (
        <SearchWidgetSkeleton lines={6} />
      ) : !ready ? (
        <SearchWidgetNotice source={source} failure={failure} onRetry={retry} />
      ) : rows.length === 0 ? (
        <SearchWidgetNotice empty />
      ) : (
        <SearchRowList rows={rows} labelHeader={config.header} valueHeader="Clicks" />
      )}
    </SearchWidgetCard>
  );
}
