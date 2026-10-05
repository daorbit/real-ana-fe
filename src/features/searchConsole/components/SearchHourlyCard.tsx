import { useMemo, useState, type CSSProperties } from "react";
import { SegmentedControl, Skeleton, Text } from "@mantine/core";
import dayjs from "dayjs";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compact } from "@/shared/lib";
import { useGetSearchHourlyQuery } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { demoSearchHourly } from "@/features/demo/demoSearchConsole";
import type { SearchHourly, SearchMetrics, SearchType } from "@/shared/types";
import { METRIC_BY_KEY, metricChange } from "../searchMetrics";
import classes from "./searchConsole.module.css";
import h from "./hourly.module.css";

type HourlyMetric = "clicks" | "impressions";
type Point = SearchHourly["hours"][number] & { recent: boolean };

const AXIS_TICK = { fill: "var(--text-2)", fontSize: 11 };

function hourTick(iso: string) {
  const at = dayjs(iso);
  return at.hour() === 0 ? at.format("ddd") : at.format("h A");
}

function HourTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: Point }>;
  metric: HourlyMetric;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  const def = METRIC_BY_KEY[metric];
  return (
    <div className={h.tooltip}>
      <div className={h.tooltipTitle}>{dayjs(point.hour).format("ddd, MMM D · h A")}</div>
      <div className={h.tooltipRow}>
        <span>{def.short}</span>
        <span className={h.tooltipValue}>{def.format(point[metric])}</span>
      </div>
    </div>
  );
}

function Stat({ metric, current, previous }: { metric: HourlyMetric; current: SearchMetrics; previous: SearchMetrics | null }) {
  const def = METRIC_BY_KEY[metric];
  const change = metricChange(def, current[metric], previous?.[metric]);
  return (
    <div className={h.stat}>
      <span className={h.statLabel}>{def.short} · last 24h</span>
      <span className={h.statValue}>
        {def.format(current[metric])}
        {change && (
          <span className={h.change} data-bad={!change.good || undefined} data-flat={change.flat || undefined}>
            {change.text}
          </span>
        )}
      </span>
    </div>
  );
}

export function SearchHourlyCard({ workspaceId, siteId, type }: { workspaceId: string; siteId: string; type: SearchType }) {
  const [metric, setMetric] = useState<HourlyMetric>("clicks");
  const real = useGetSearchHourlyQuery({ workspaceId, siteId, type });
  const { demo } = useDemo();
  const sample = useMemo(() => (demo ? demoSearchHourly(type) : null), [demo, type]);
  const data = sample ?? real.data;
  const isLoading = sample ? false : real.isLoading;
  const error = sample ? undefined : real.error;
  const color = METRIC_BY_KEY[metric].color;

  const points: Point[] = (data?.hours ?? []).map((p, i, all) => ({ ...p, recent: i >= all.length - 24 }));
  const ticks = points.filter((p) => dayjs(p.hour).hour() % 6 === 0).map((p) => p.hour);

  return (
    <div className={classes.card}>
      <div className={classes.cardHead}>
        <div>
          <Text fw={650} size="sm">
            Last 48 hours
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Hour by hour in your time zone. Google updates this through the day, so it shows the effect of a new post
            or launch long before the daily chart.
          </Text>
        </div>
        <SegmentedControl
          size="xs"
          value={metric}
          onChange={(v) => setMetric(v as HourlyMetric)}
          data={[
            { value: "clicks", label: "Clicks" },
            { value: "impressions", label: "Impressions" },
          ]}
        />
      </div>

      {isLoading ? (
        <Skeleton height={260} radius="md" />
      ) : error || !data ? (
        <Text className={h.empty}>Hourly data isn&apos;t available for this property or search type yet.</Text>
      ) : points.length === 0 ? (
        <Text className={h.empty}>No hourly data yet. It appears once Google records impressions in the last few days.</Text>
      ) : (
        <>
          <div className={h.stats} style={{ "--metric": color } as CSSProperties}>
            <Stat metric="clicks" current={data.last24} previous={data.previous24} />
            <Stat metric="impressions" current={data.last24} previous={data.previous24} />
            <div className={h.legend}>
              <span className={h.legendItem}>
                <span className={h.swatch} data-faded />
                Previous 24h
              </span>
              <span className={h.legendItem}>
                <span className={h.swatch} />
                Last 24h
              </span>
            </div>
          </div>

          <div className={h.chart}>
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <BarChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: -8 }} barCategoryGap="18%">
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="hour"
                  ticks={ticks}
                  tickFormatter={hourTick}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  allowDecimals={false}
                  tickFormatter={compact}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-2)" }}
                  content={<HourTooltip metric={metric} />}
                  isAnimationActive={false}
                />
                <Bar dataKey={metric} radius={[3, 3, 0, 0]} animationDuration={400}>
                  {points.map((p) => (
                    <Cell
                      key={p.hour}
                      fill={p.recent ? color : `color-mix(in srgb, ${color} 40%, var(--surface))`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
