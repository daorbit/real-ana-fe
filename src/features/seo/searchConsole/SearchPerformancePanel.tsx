import { useState } from "react";
import {
  ActionIcon, Alert, Menu, SegmentedControl, SimpleGrid, Skeleton, Stack, Text, Tooltip,
} from "@mantine/core";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Link2Off, MoreHorizontal, RefreshCw, Unplug } from "lucide-react";
import dayjs from "dayjs";
import { useGetSearchPerformanceQuery, useRefreshSearchPerformanceMutation } from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
import { timeAgo } from "@/shared/lib";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import { METRICS, RANGES, metricChange, pagePath, propertyLabel, type MetricKey } from "./searchMetrics";
import { SearchPerformanceChart } from "./SearchPerformanceChart";
import { SearchTopTable } from "./SearchTopTable";
import classes from "./searchConsole.module.css";

export function SearchPerformancePanel({
  workspaceId,
  siteId,
  propertyUrl,
  googleEmail,
  onChangeProperty,
  onDisconnect,
}: {
  workspaceId: string;
  siteId: string;
  propertyUrl: string;
  googleEmail: string;
  onChangeProperty?: () => void;
  onDisconnect?: () => void;
}) {
  const [days, setDays] = useState(28);
  const [metricKey, setMetricKey] = useState<MetricKey>("clicks");

  const { data, isFetching, isLoading, error } = useGetSearchPerformanceQuery({
    workspaceId,
    siteId,
    days,
  });
  const [refreshPerformance, { isLoading: refreshing }] = useRefreshSearchPerformanceMutation();

  const reload = async () => {
    try {
      await refreshPerformance({ workspaceId, siteId, days }).unwrap();
    } catch (e) {
      notify.error(errMessage(e, "Could not refresh from Google."));
    }
  };

  const metric = METRICS.find((m) => m.key === metricKey) ?? METRICS[0];

  return (
    <section className={classes.section}>
      <div className={classes.header}>
        <div className={classes.headerText}>
          <span className={classes.brandMark}>
            <GoogleMark size={18} />
          </span>
          <div>
            <Text fw={650} size="sm">
              Google Search Console
            </Text>
            <div className={classes.meta}>
              <span>{propertyLabel(propertyUrl)}</span>
              {googleEmail && (
                <>
                  <span className={classes.metaDot} />
                  <span>{googleEmail}</span>
                </>
              )}
              {data?.fetchedAt && (
                <>
                  <span className={classes.metaDot} />
                  <span>Updated {timeAgo(data.fetchedAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={classes.headerActions}>
          <SegmentedControl
            size="xs"
            value={String(days)}
            onChange={(v) => setDays(Number(v))}
            data={RANGES}
            disabled={isFetching}
          />
          <Tooltip label="Fetch the latest from Google" withArrow>
            <ActionIcon
              variant="default"
              loading={refreshing || isFetching}
              onClick={() => void reload()}
              aria-label="Refresh"
            >
              <RefreshCw size={15} />
            </ActionIcon>
          </Tooltip>
          {(onChangeProperty || onDisconnect) && (
            <Menu position="bottom-end" withArrow width={220}>
              <Menu.Target>
                <ActionIcon variant="default" aria-label="Search Console settings">
                  <MoreHorizontal size={15} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {onChangeProperty && (
                  <Menu.Item leftSection={<Link2Off size={14} />} onClick={onChangeProperty}>
                    Change property
                  </Menu.Item>
                )}
                {onDisconnect && (
                  <Menu.Item color="red" leftSection={<Unplug size={14} />} onClick={onDisconnect}>
                    Disconnect Search Console
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </div>
      </div>

      {error && !data ? (
        <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
          {errMessage(error, "Search Console data could not be loaded.")}
        </Alert>
      ) : isLoading || !data ? (
        <Stack gap="md">
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            {METRICS.map((m) => (
              <Skeleton key={m.key} height={84} radius="md" />
            ))}
          </SimpleGrid>
          <Skeleton height={300} radius="md" />
        </Stack>
      ) : (
        <>
          <div className={classes.tiles} role="group" aria-label="Chart metric">
            {METRICS.map((m) => {
              const change = metricChange(m, data.totals[m.key], data.previous?.[m.key]);
              return (
                <button
                  key={m.key}
                  type="button"
                  className={classes.tile}
                  data-active={m.key === metricKey || undefined}
                  aria-pressed={m.key === metricKey}
                  onClick={() => setMetricKey(m.key)}
                >
                  <span className={classes.tileLabel}>{m.label}</span>
                  <span className={classes.tileValue}>{m.format(data.totals[m.key])}</span>
                  {change ? (
                    <span className={classes.change} data-good={change.good || undefined} data-flat={change.flat || undefined}>
                      {!change.flat && (change.good ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
                      {change.text} vs previous
                    </span>
                  ) : (
                    <span className={classes.tileLabel}>No earlier data</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className={classes.card}>
            <div className={classes.cardHead}>
              <div>
                <Text fw={650} size="sm">
                  {metric.label} per day
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {dayjs(data.startDate).format("MMM D")} – {dayjs(data.endDate).format("MMM D, YYYY")}.
                  Google's numbers settle over 2–3 days, so the latest days may still rise.
                </Text>
              </div>
            </div>
            {data.daily.length ? (
              <SearchPerformanceChart daily={data.daily} metric={metric} />
            ) : (
              <Text size="sm" c="dimmed">
                No search data for this period yet. New properties take a few days to fill in.
              </Text>
            )}
          </div>

          <div className={classes.tables}>
            <SearchTopTable
              title="Top queries"
              description="What people searched before clicking or seeing your site."
              labelHeader="Query"
              rows={data.queries.map((q) => ({ ...q, label: q.query }))}
              emptyText="No queries recorded for this period."
            />
            <SearchTopTable
              title="Top pages"
              description="Your pages that appeared in Google results."
              labelHeader="Page"
              rows={data.pages.map((p) => ({ ...p, label: pagePath(p.page), href: p.page }))}
              emptyText="No pages recorded for this period."
            />
          </div>
        </>
      )}
    </section>
  );
}
