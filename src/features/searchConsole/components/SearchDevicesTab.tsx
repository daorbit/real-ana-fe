import { useMemo } from "react";
import { Alert, Text } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { useGetSearchBreakdownQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { useDemo } from "@/features/demo/context";
import { demoSearchBreakdown } from "@/features/demo/demoSearchConsole";
import type { SearchType } from "@/shared/types";
import { DeviceShareDonut } from "./DeviceShareDonut";
import { DeviceComparison } from "./DeviceComparison";
import { DevicesSkeleton } from "./SearchSkeletons";
import classes from "./devices.module.css";

export function SearchDevicesTab({
  workspaceId,
  siteId,
  days,
  type,
}: {
  workspaceId: string;
  siteId: string;
  days: number;
  type: SearchType;
}) {
  const real = useGetSearchBreakdownQuery({
    workspaceId,
    siteId,
    dimension: "device",
    days,
    type,
    pageSize: 200,
  });

  const { demo } = useDemo();
  const sample = useMemo(() => (demo ? demoSearchBreakdown("device", days) : null), [demo, days]);
  const data = sample ?? real.data;
  const isLoading = sample ? false : real.isLoading;
  const error = sample ? undefined : real.error;

  if (isLoading) return <DevicesSkeleton />;
  if (error || !data) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Search visibility data could not be loaded.")}
      </Alert>
    );
  }

  if (!data.rows.length) {
    return (
      <div className={classes.card}>
        <Text size="sm" c="dimmed">
          No device data for this period yet.
        </Text>
      </div>
    );
  }

  const rows = [...data.rows].sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);

  return (
    <div className={classes.layout}>
      <DeviceShareDonut rows={rows} />
      <DeviceComparison rows={rows} />
    </div>
  );
}
