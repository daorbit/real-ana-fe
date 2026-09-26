import { Alert, Progress, Skeleton, Text } from "@mantine/core";
import { AlertTriangle, Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import { useGetSearchBreakdownQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { SearchType } from "@/shared/types";
import { METRICS, metricChange } from "../searchMetrics";
import classes from "./searchConsole.module.css";

const DEVICES: Record<string, { label: string; icon: LucideIcon }> = {
  DESKTOP: { label: "Desktop", icon: Monitor },
  MOBILE: { label: "Mobile", icon: Smartphone },
  TABLET: { label: "Tablet", icon: Tablet },
};

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
  const { data, isLoading, error } = useGetSearchBreakdownQuery({
    workspaceId,
    siteId,
    dimension: "device",
    days,
    type,
    pageSize: 200,
  });

  if (isLoading) return <Skeleton height={220} radius="md" />;
  if (error || !data) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Search Console data could not be loaded.")}
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

  const totalClicks = data.rows.reduce((sum, r) => sum + r.clicks, 0);

  return (
    <div className={classes.deviceGrid}>
      {data.rows.map((row) => {
        const device = DEVICES[row.key.toUpperCase()] ?? { label: row.key, icon: Monitor };
        const Icon = device.icon;
        const share = totalClicks ? (row.clicks / totalClicks) * 100 : 0;
        const change =
          row.previousClicks === null ? null : metricChange(METRICS[0], row.clicks, row.previousClicks);

        return (
          <div key={row.key} className={classes.card}>
            <div className={classes.deviceHead}>
              <span className={classes.deviceIcon}>
                <Icon size={17} />
              </span>
              <div>
                <Text fw={650} size="sm">
                  {device.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {share.toFixed(0)}% of clicks
                </Text>
              </div>
            </div>
            <Progress value={share} size="sm" radius="xl" mt="md" aria-label={`${device.label} share of clicks`} />
            <dl className={classes.deviceStats}>
              {METRICS.map((m) => (
                <div key={m.key}>
                  <dt>{m.label}</dt>
                  <dd>{m.format(row[m.key])}</dd>
                </div>
              ))}
            </dl>
            {change && (
              <span className={classes.change} data-good={change.good || undefined} data-flat={change.flat || undefined}>
                {change.text} clicks vs previous
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
