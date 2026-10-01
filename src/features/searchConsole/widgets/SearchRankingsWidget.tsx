import type { CSSProperties } from "react";
import { ChartNoAxesColumn } from "lucide-react";
import { num } from "@/shared/lib";
import { SearchWidgetNotice } from "@/features/searchConsole/widgets/SearchWidgetNotice";
import { SearchWidgetCard, SearchWidgetSkeleton } from "@/features/searchConsole/widgets/SearchWidgetCard";
import { useSearchInsightsData } from "@/features/searchConsole/widgets/useSearchWidgetData";
import type { SearchSource } from "@/features/searchConsole/widgets/useSearchWidgetSource";
import type { SearchPositionBand } from "@/shared/types";
import insights from "@/features/searchConsole/components/insights.module.css";
import classes from "@/features/searchConsole/widgets/searchWidgets.module.css";

const BAND_LABEL: Record<SearchPositionBand["band"], string> = {
  "1-3": "Top 3",
  "4-10": "Rest of page 1",
  "11-20": "Page 2",
  "21+": "Beyond page 2",
};

export function SearchRankingsWidget({ source }: { source: SearchSource }) {
  const { data, loading, failure, retry } = useSearchInsightsData(source);
  const ready = source.kind === "ready" && data && !failure;
  const bands = ready ? data.positionBands : [];
  const total = bands.reduce((sum, b) => sum + b.queries, 0);

  return (
    <SearchWidgetCard
      icon={ChartNoAxesColumn}
      title="Ranking positions"
      subtitle={ready ? `${num(total)} queries · last ${data.days} days` : undefined}
      tab="insights"
    >
      {source.kind === "loading" || loading ? (
        <SearchWidgetSkeleton lines={5} />
      ) : !ready ? (
        <SearchWidgetNotice source={source} failure={failure} onRetry={retry} />
      ) : total === 0 ? (
        <SearchWidgetNotice empty />
      ) : (
        <>
          <div className={insights.bandBar} role="img" aria-label="Share of queries in each position range">
            {bands.map((b) =>
              b.queries ? (
                <span
                  key={b.band}
                  className={insights.bandSegment}
                  data-band={b.band}
                  style={{ "--share": `${(b.queries / total) * 100}%` } as CSSProperties}
                />
              ) : null,
            )}
          </div>
          <div className={classes.bandList}>
            {bands.map((b) => (
              <div key={b.band} className={classes.bandRow} data-band={b.band}>
                <span className={classes.bandName}>
                  <span className={insights.bandDot} />
                  {BAND_LABEL[b.band]}
                </span>
                <span className={classes.bandCount}>{num(b.queries)}</span>
                <span className={insights.bandMove} data-dir={b.netMoved > 0 ? "up" : b.netMoved < 0 ? "down" : undefined}>
                  {b.netMoved === 0 ? "±0" : `${b.netMoved > 0 ? "+" : "−"}${num(Math.abs(b.netMoved))}`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </SearchWidgetCard>
  );
}
