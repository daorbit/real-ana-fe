import { useEffect, useMemo, useState } from "react";
import { Alert, Text } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { useGetSearchDrilldownQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { PanelDrawer } from "@/shared/ui/PanelDrawer";
import { useDemo } from "@/features/demo/context";
import { demoSearchDrilldown } from "@/features/demo/demoSearchConsole";
import type { SearchType } from "@/shared/types";
import { pagePath, type MetricKey } from "../searchMetrics";
import { SearchMetricTiles, toggleMetric } from "./SearchMetricTiles";
import { SearchPerformanceChart } from "./SearchPerformanceChart";
import { SearchTopTable } from "./SearchTopTable";
import { DrawerSkeleton } from "./SearchSkeletons";
import classes from "./drawer.module.css";

export function SearchDrilldownDrawer({
  query,
  onClose,
  onOpenPage,
  workspaceId,
  siteId,
  days,
  type,
}: {
  query: string | null;
  onClose: () => void;
  onOpenPage: (url: string) => void;
  workspaceId: string;
  siteId: string;
  days: number;
  type: SearchType;
}) {
  const [selected, setSelected] = useState<MetricKey[]>(["clicks", "impressions"]);
  const [shown, setShown] = useState<string | null>(query);

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

  return (
    <PanelDrawer
      opened={Boolean(query)}
      onClose={onClose}
      size={760}
      ariaLabel="Search query details"
      header={
        <div>
          <Text className={classes.eyebrow}>Search query</Text>
          <Text className={classes.title}>{shown}</Text>
        </div>
      }
    >
      {error && !loaded ? (
        <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
          {errMessage(error, "Could not load details from Google.")}
        </Alert>
      ) : !loaded ? (
        <DrawerSkeleton />
      ) : (
        <>
          <SearchMetricTiles
            columns={2}
            totals={loaded.totals}
            previous={loaded.previous}
            daily={loaded.daily}
            selected={selected}
            onToggle={(key) => setSelected((s) => toggleMetric(s, key))}
          />

          {loaded.daily.length > 1 ? (
            <SearchPerformanceChart daily={loaded.daily} selected={selected} />
          ) : (
            <Text size="sm" c="dimmed">
              Not enough daily data to chart yet.
            </Text>
          )}

          <SearchTopTable
            title="Pages ranking for this query"
            description="Open a page to see its full search performance and index status."
            labelHeader="Page"
            rows={loaded.related.map((r) => ({ ...r, label: pagePath(r.key) }))}
            emptyText="Nothing recorded for this period."
            onOpenRow={(row) => onOpenPage(row.key)}
          />
        </>
      )}
    </PanelDrawer>
  );
}
