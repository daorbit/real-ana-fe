import { Center, Loader } from "@mantine/core";
import { Inbox } from "lucide-react";
import dayjs from "dayjs";
import { useGetRetentionQuery } from "@/app/store";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { num } from "@/shared/lib";
import classes from "./RetentionGrid.module.css";

function cellStyle(pct: number, first: boolean, strongest: number): React.CSSProperties {
  const alpha = pct === 0 ? 0 : first ? 0.9 : 0.14 + (pct / Math.max(1, strongest)) * 0.6;
  return {
    background:
      pct === 0
        ? "var(--surface)"
        : `color-mix(in srgb, var(--viz-seq) ${Math.round(alpha * 100)}%, transparent)`,
    color: alpha >= 0.45 ? "#ffffff" : "var(--mantine-color-text)",
  };
}

/**
 * Weekly retention cohorts as a triangular heatmap. Each row is the group of
 * visitors first seen in one week; each cell shows the share still active N
 * weeks later. Warmer cells = stickier cohorts.
 */
export function RetentionGrid({
  workspaceId,
  sites,
}: {
  workspaceId: string;
  /** siteIds to scope to; empty/undefined means every site. */
  sites?: string[];
}) {
  const { data, isLoading } = useGetRetentionQuery({ workspaceId, weeks: 6, sites });

  const weeks = data?.weeks ?? 6;
  const cohorts = data?.cohorts ?? [];
  const hasData = cohorts.some((c) => c.size > 0);
  const strongest = Math.max(0, ...cohorts.flatMap((c) => c.retention.slice(1)));
  const weekOf = (cohort: number) => dayjs().subtract((weeks - cohort) * 7, "day").format("MMM D");

  return (
    <RankCard
      title="Weekly retention"
      subtitle="Visitors grouped by the week of their first visit"
      tone="blue"
      fill={false}
    >
      {isLoading ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : !hasData ? (
        <RankEmpty icon={Inbox}>
          Not enough history yet. Retention needs visitors returning across several weeks — check back once the
          site has run for a while.
        </RankEmpty>
      ) : (
        <div className={classes.scroll}>
          <table className="retention-table">
            <thead>
              <tr>
                <th className="ret-head">Week of</th>
                <th className="ret-head">Visitors</th>
                {Array.from({ length: weeks }, (_, i) => (
                  <th key={i} className="ret-head ret-week">Week {i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.cohort}>
                  <td className="ret-label">{weekOf(c.cohort)}</td>
                  <td className="ret-size">{num(c.size)}</td>
                  {Array.from({ length: weeks }, (_, i) => {
                    const pct = c.retention[i];
                    const measurable = i <= weeks - 1 - c.cohort;
                    if (!measurable || pct == null) {
                      return <td key={i} className="ret-cell ret-empty" />;
                    }
                    return (
                      <td key={i} className="ret-cell" style={cellStyle(pct, i === 0, strongest)}>
                        {pct}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className={classes.note}>
            Week 0 is the week a visitor first came. Each cell is the share that came back that many weeks later.
          </p>
        </div>
      )}
    </RankCard>
  );
}
