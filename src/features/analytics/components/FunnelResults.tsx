import { SegmentedControl } from "@mantine/core";
import { num } from "@/shared/lib";
import { FunnelFlowView } from "@/features/analytics/components/FunnelFlowView";
import { FunnelBarsView } from "@/features/analytics/components/funnel/FunnelBarsView";
import { FunnelListView } from "@/features/analytics/components/funnel/FunnelListView";
import { FunnelSummary } from "@/features/analytics/components/funnel/FunnelSummary";
import classes from "@/features/analytics/components/funnel/Funnel.module.css";
import type { FunnelResultStep } from "@/shared/types";

export type FunnelView = "bars" | "list" | "flow";

const VIEWS: { value: FunnelView; label: string }[] = [
  { value: "bars", label: "Chart" },
  { value: "list", label: "List" },
  { value: "flow", label: "Flow" },
];

export function FunnelResults({
  result,
  view,
  onViewChange,
}: {
  result: FunnelResultStep[];
  view: FunnelView;
  onViewChange: (v: FunnelView) => void;
}) {
  const entered = result[0]?.count ?? 0;

  return (
    <section className={`${classes.panel} ${classes.results}`} aria-labelledby="funnel-results-title">
      <header className={classes.head}>
        <div className={classes.headText}>
          <h3 id="funnel-results-title" className={classes.title}>Results</h3>
          <p className={classes.subtitle}>
            {entered === 0
              ? "No sessions reached the first step in this range."
              : `${num(entered)} sessions started, counted in step order.`}
          </p>
        </div>
        {entered > 0 && (
          <SegmentedControl
            size="xs"
            radius="xl"
            value={view}
            onChange={(v) => onViewChange(v as FunnelView)}
            data={VIEWS}
          />
        )}
      </header>

      {entered === 0 ? (
        <p className={classes.empty}>Try a wider date range, or start the funnel on a busier page.</p>
      ) : (
        <>
          <FunnelSummary steps={result} />
          {view === "flow" ? (
            <FunnelFlowView steps={result} />
          ) : view === "list" ? (
            <FunnelListView steps={result} />
          ) : (
            <FunnelBarsView steps={result} />
          )}
        </>
      )}
    </section>
  );
}
