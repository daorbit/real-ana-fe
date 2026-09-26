import { Text } from "@mantine/core";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import dayjs from "dayjs";
import type { SearchPerformance } from "@/shared/types";
import type { MetricDef } from "./searchMetrics";
import classes from "./searchConsole.module.css";

type Point = SearchPerformance["daily"][number];

function ChartTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: { payload: Point }[];
  metric: MetricDef;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className={classes.tooltip}>
      <Text size="xs" c="dimmed">
        {dayjs(point.date).format("ddd, MMM D, YYYY")}
      </Text>
      <Text size="sm" fw={650}>
        {metric.format(point[metric.key])} {metric.key === "position" ? "avg. position" : metric.label.toLowerCase()}
      </Text>
    </div>
  );
}

export function SearchPerformanceChart({
  daily,
  metric,
}: {
  daily: SearchPerformance["daily"];
  metric: MetricDef;
}) {
  const axisTick = { fontSize: 11, fill: "var(--muted)" };
  const gradientId = `gsc-${metric.key}`;

  return (
    <div className={classes.chart}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={daily} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
            tickFormatter={(d: string) => dayjs(d).format("MMM D")}
          />
          <YAxis
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={48}
            reversed={metric.lowerIsBetter}
            allowDecimals={metric.key === "ctr" || metric.key === "position"}
            domain={metric.lowerIsBetter ? ["dataMin", "dataMax"] : [0, "auto"]}
            tickFormatter={(v: number) =>
              metric.key === "ctr" ? `${(v * 100).toFixed(1)}%` : metric.key === "position" ? v.toFixed(0) : metric.format(v)
            }
          />
          <Tooltip
            content={<ChartTooltip metric={metric} />}
            cursor={{ stroke: "var(--accent)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey={metric.key}
            stroke="var(--accent)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: "var(--accent)", stroke: "var(--surface)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
