import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, Center, Group, Stack, Text } from "@mantine/core";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnalyticsArt } from "@/shared/ui/Brand";
import { ADD_SITE_PATH } from "@/features/workspace/paths";
import { markerLines, MarkerLegend, MarkerButton } from "@/features/analytics/components/MarkerLayer";
import { TrafficTrendTooltip } from "@/features/analytics/components/trend/TrafficTrendTooltip";
import { TrafficTrendLegend } from "@/features/analytics/components/trend/TrafficTrendLegend";
import {
  TREND_SERIES, trendMetrics, type TrendMetric, type TrendPoint,
} from "@/features/analytics/lib/trafficSeries";
import type { Marker } from "@/shared/types";

const AXIS_TICK = { fontSize: 11, fill: "var(--muted)" };
const CHART_MARGIN = { top: 8, right: 8, left: -18, bottom: 0 };

export function TrafficTrendCard({
  series,
  hasData,
  comparing,
  focus,
  onFocus,
  markers,
  hourly,
  onOpenMarkers,
}: {
  series: TrendPoint[];
  hasData: boolean;
  comparing: boolean;
  focus: TrendMetric | null;
  onFocus: (metric: TrendMetric) => void;
  markers: Marker[];
  hourly: boolean;
  onOpenMarkers: () => void;
}) {
  const { t } = useTranslation();
  const metrics = trendMetrics(focus);
  const baselineKey = TREND_SERIES[metrics[0]].compareKey;

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group gap={8} wrap="nowrap">
          <Text fw={600} c="dimmed" size="sm">{t("analytics.trafficOverTime")}</Text>
          <MarkerButton onClick={onOpenMarkers} count={markers.length} />
        </Group>
        {hasData && (
          <Group gap="md" wrap="nowrap">
            <TrafficTrendLegend focus={focus} onFocus={onFocus} comparing={comparing} />
            <MarkerLegend markers={markers} />
          </Group>
        )}
      </Group>
      {hasData ? (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={series} syncId="analytics-overview" margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--viz-grid)" vertical={false} />
            <XAxis dataKey="bucket" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis tick={AXIS_TICK} allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip
              content={<TrafficTrendTooltip metrics={metrics} comparing={comparing} />}
              cursor={{ stroke: "var(--viz-baseline)", strokeWidth: 1 }}
            />
            {comparing && (
              <Area
                type="monotone"
                dataKey={baselineKey}
                stroke="var(--viz-baseline)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                dot={false}
                activeDot={false}
              />
            )}
            {metrics.map((metric, i) => (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={TREND_SERIES[metric].color}
                strokeWidth={i === 0 ? 2 : 1.5}
                fill={i === 0 ? TREND_SERIES[metric].color : "none"}
                fillOpacity={0.08}
                dot={false}
                activeDot={{ r: 4, fill: TREND_SERIES[metric].color, stroke: "var(--surface)", strokeWidth: 2 }}
              />
            ))}
            {markerLines(markers, series, hourly)}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <Center h={260}>
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
    </Card>
  );
}
