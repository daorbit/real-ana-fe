import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Center, Group, Stack, Text } from "@mantine/core";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnalyticsArt } from "@/shared/ui/Brand";
import { RankCard } from "@/shared/ui/rank/RankCard";
import { ADD_SITE_PATH } from "@/features/workspace/paths";
import { markerLines, MarkerLegend, MarkerButton } from "@/features/analytics/components/MarkerLayer";
import { TrafficTrendTooltip } from "@/features/analytics/components/trend/TrafficTrendTooltip";
import { TrafficMetricSwitch, TrafficPeriodLegend } from "@/features/analytics/components/trend/TrafficTrendLegend";
import { TREND_SERIES, type TrendMetric, type TrendPoint } from "@/features/analytics/lib/trafficSeries";
import type { Marker } from "@/shared/types";
import classes from "@/features/analytics/components/trend/TrafficTrend.module.css";

const AXIS_TICK = { fontSize: 11, fill: "var(--muted)" };
const CHART_MARGIN = { top: 10, right: 6, left: -14, bottom: 0 };
const CHART_HEIGHT = 260;

export function TrafficTrendCard({
  series,
  hasData,
  comparing,
  baselineLabel,
  metric,
  onMetric,
  markers,
  hourly,
  onOpenMarkers,
}: {
  series: TrendPoint[];
  hasData: boolean;
  comparing: boolean;
  baselineLabel: string;
  metric: TrendMetric;
  onMetric: (metric: TrendMetric) => void;
  markers: Marker[];
  hourly: boolean;
  onOpenMarkers: () => void;
}) {
  const { t } = useTranslation();
  const spec = TREND_SERIES[metric];

  return (
    <RankCard
      title={`${spec.label} over time`}
      subtitle={hourly ? "Hourly for the selected range" : "Daily for the selected range"}
      tone="blue"
      actions={
        <>
          {hasData && <TrafficMetricSwitch value={metric} onChange={onMetric} />}
          <MarkerButton onClick={onOpenMarkers} count={markers.length} />
        </>
      }
    >
      {hasData ? (
        <>
          <Group gap="md" className={classes.legendRow}>
            <TrafficPeriodLegend metric={metric} comparing={comparing} baselineLabel={baselineLabel} />
            <MarkerLegend markers={markers} />
          </Group>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <AreaChart data={series} syncId="analytics-overview" margin={CHART_MARGIN}>
              <CartesianGrid stroke="var(--viz-grid)" vertical={false} />
              <XAxis dataKey="bucket" tick={AXIS_TICK} tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
              <YAxis tick={AXIS_TICK} allowDecimals={false} tickLine={false} axisLine={false} width={44} />
              <Tooltip
                content={<TrafficTrendTooltip metrics={[metric]} comparing={comparing} />}
                cursor={{ stroke: "var(--viz-cursor)", strokeWidth: 1 }}
              />
              {comparing && (
                <Area
                  type="monotone"
                  dataKey={spec.compareKey}
                  stroke="var(--viz-baseline)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                  dot={false}
                  activeDot={false}
                />
              )}
              <Area
                type="monotone"
                dataKey={metric}
                stroke={spec.color}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                dot={false}
                activeDot={{ r: 5, fill: "var(--surface)", stroke: spec.color, strokeWidth: 2.5 }}
                animationDuration={700}
              />
              {markerLines(markers, series, hourly)}
            </AreaChart>
          </ResponsiveContainer>
        </>
      ) : (
        <Center h={CHART_HEIGHT}>
          <Stack align="center" gap={6}>
            <AnalyticsArt />
            <Text fw={600} size="sm" mt="xs">{t("analytics.noPageviews")}</Text>
            <Text c="dimmed" size="xs" ta="center" maw={320}>
              Add a site in Workspaces and paste its snippet into your app.
            </Text>
            <Button component={Link} to={ADD_SITE_PATH} size="xs" variant="light" mt={6}>Add a site</Button>
          </Stack>
        </Center>
      )}
    </RankCard>
  );
}
