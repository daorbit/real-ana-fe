import { useEffect, useState } from "react";
import { Alert, Drawer, Stack, Skeleton, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { AlertTriangle } from "lucide-react";
import { useGetSearchDrilldownQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { SearchType } from "@/shared/types";
import { pagePath, type MetricKey } from "../searchMetrics";
import { SearchMetricTiles, toggleMetric } from "./SearchMetricTiles";
import { SearchPerformanceChart } from "./SearchPerformanceChart";
import { SearchTopTable } from "./SearchTopTable";
import classes from "./searchConsole.module.css";

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
  const phone = useMediaQuery("(max-width: 48em)") ?? false;
  const [selected, setSelected] = useState<MetricKey[]>(["clicks", "impressions"]);

  useEffect(() => setSelected(["clicks", "impressions"]), [query]);

  const { data, isFetching, error } = useGetSearchDrilldownQuery(
    { workspaceId, siteId, days, type, dimension: "query", value: query ?? "" },
    { skip: !query },
  );

  const fresh = data && query && data.value === query && data.dimension === "query";

  return (
    <Drawer
      opened={Boolean(query)}
      onClose={onClose}
      position={phone ? "bottom" : "right"}
      size={phone ? "90%" : 680}
      radius={phone ? "lg" : 0}
      title={
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Search query
          </Text>
          <Text fw={700} size="lg" className={classes.drawerValue}>
            {query}
          </Text>
        </div>
      }
    >
      {error && !fresh ? (
        <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
          {errMessage(error, "Could not load details from Google.")}
        </Alert>
      ) : !fresh || isFetching ? (
        <Stack gap="md">
          <Skeleton height={90} radius="md" />
          <Skeleton height={240} radius="md" />
          <Skeleton height={200} radius="md" />
        </Stack>
      ) : (
        <Stack gap="lg">
          <SearchMetricTiles
            twoColumns
            totals={data.totals}
            previous={data.previous}
            daily={data.daily}
            selected={selected}
            onToggle={(key) => setSelected((s) => toggleMetric(s, key))}
          />

          {data.daily.length > 1 ? (
            <SearchPerformanceChart daily={data.daily} selected={selected} />
          ) : (
            <Text size="sm" c="dimmed">
              Not enough daily data to chart yet.
            </Text>
          )}

          <SearchTopTable
            title="Pages ranking for this query"
            description="Open a page to see its full search performance and index status."
            labelHeader="Page"
            rows={data.related.map((r) => ({ ...r, label: pagePath(r.key) }))}
            emptyText="Nothing recorded for this period."
            onOpenRow={(row) => onOpenPage(row.key)}
          />
        </Stack>
      )}
    </Drawer>
  );
}
