import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Text } from "@mantine/core";
import { ListPlus } from "lucide-react";
import { useGetSearchDrilldownQuery } from "@/app/store";
import { ErrorState } from "@/shared/ui/ErrorState";
import { errMessage } from "@/shared/lib/notify";
import { useDemo } from "@/features/demo/context";
import { demoSearchDrilldown } from "@/features/demo/demoSearchConsole";
import type { SearchType } from "@/shared/types";
import { METRIC_BY_KEY, pagePath, type MetricKey } from "../searchMetrics";
import { useSearchTask } from "../useSearchTask";
import { SearchMetricTiles, toggleMetric } from "./SearchMetricTiles";
import { SearchPerformanceChart } from "./SearchPerformanceChart";
import { SearchTopTable } from "./SearchTopTable";
import { AskOrbitSearchButton } from "./AskOrbitSearchButton";
import { DrawerSkeleton } from "./SearchSkeletons";
import classes from "./drawer.module.css";

const QUERIES_PATH = "/app/search-visibility?tab=queries";

export function SearchQuerySheet({
  query,
  onClose,
  onOpenPage,
  onAskOrbit,
  workspaceId,
  siteId,
  days,
  type,
}: {
  query: string | null;
  onClose: () => void;
  onOpenPage: (url: string) => void;
  onAskOrbit?: (query: string) => void;
  workspaceId: string;
  siteId: string;
  days: number;
  type: SearchType;
}) {
  const [selected, setSelected] = useState<MetricKey[]>(["clicks", "impressions"]);
  const [shown, setShown] = useState<string | null>(query);
  const task = useSearchTask(workspaceId);

  useEffect(() => {
    if (query) {
      setShown(query);
      setSelected(["clicks", "impressions"]);
    }
  }, [query]);

  const real = useGetSearchDrilldownQuery(
    { workspaceId, siteId, days, type, dimension: "query", value: shown ?? "" },
    { skip: !shown },
  );
  const { demo } = useDemo();
  const sample = useMemo(
    () => (demo && shown ? demoSearchDrilldown("query", shown, days) : null),
    [demo, shown, days],
  );
  const data = sample ?? real.data;
  const isFetching = sample ? false : real.isFetching;
  const error = sample ? undefined : real.error;
  const loaded = data && data.value === shown && data.dimension === "query" && !isFetching ? data : null;

  const makeTask = () => {
    if (!shown || !loaded) return;
    const { clicks, impressions, position } = loaded.totals;
    void task.toTask({
      title: `Improve “${shown}” in Google`,
      notes: `${METRIC_BY_KEY.clicks.format(clicks)} clicks, ${METRIC_BY_KEY.impressions.format(impressions)} impressions, average position ${METRIC_BY_KEY.position.format(position)} over the last ${days} days.`,
      link: QUERIES_PATH,
    });
  };

  return (
    <Modal
      opened={Boolean(query)}
      onClose={onClose}
      size={720}
      radius="lg"
      centered
      aria-label="Search query details"
      title={
        <div>
          <Text className={classes.eyebrow}>Query · last {days} days</Text>
          <Text className={classes.title}>“{shown}”</Text>
        </div>
      }
    >
      <div className={classes.body}>
        {error && !loaded ? (
          <ErrorState
            compact
            title="Couldn't load from Google"
            description={errMessage(error, "Could not load details from Google.")}
            onRetry={real.refetch}
            retrying={real.isFetching}
          />
        ) : !loaded ? (
          <DrawerSkeleton />
        ) : (
          <>
            <SearchMetricTiles
              columns={4}
              totals={loaded.totals}
              previous={loaded.previous}
              daily={loaded.daily}
              selected={selected}
              onToggle={(key) => setSelected((s) => toggleMetric(s, key))}
            />

            <section className={classes.chartCard} aria-label="Daily trend">
              {loaded.daily.length > 1 ? (
                <SearchPerformanceChart daily={loaded.daily} selected={selected} />
              ) : (
                <Text size="sm" c="dimmed">
                  Not enough daily data to chart yet.
                </Text>
              )}
            </section>

            <SearchTopTable
              title="Pages ranking for it"
              description="Open a page to see its full search performance and index status."
              labelHeader="Page"
              rows={loaded.related.map((r) => ({ ...r, label: pagePath(r.key) }))}
              emptyText="Nothing recorded for this period."
              onOpenRow={(row) => onOpenPage(row.key)}
            />

            {(onAskOrbit || task.enabled) && (
              <div className={classes.actions}>
                {onAskOrbit && shown && (
                  <AskOrbitSearchButton quiet label="Ask Orbit about this query" onClick={() => onAskOrbit(shown)} />
                )}
                {task.enabled && (
                  <Button variant="default" leftSection={<ListPlus size={15} />} loading={task.busy} onClick={makeTask}>
                    Make it a task
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
