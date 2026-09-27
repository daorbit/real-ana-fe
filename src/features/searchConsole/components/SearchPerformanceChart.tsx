import { Text } from "@mantine/core";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import type { SearchPerformance } from "@/shared/types";
import { METRICS, type MetricDef, type MetricKey } from "../searchMetrics";
import classes from "./metrics.module.css";

type Point = SearchPerformance["daily"][number];

function ChartTooltip({
  active,
  payload,
  metrics,
}: {
  active?: boolean;
  payload?: { payload: Point }[];
  metrics: MetricDef[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className={classes.tooltip}>
      <Text size="xs" fw={600}>
        {dayjs(point.date).format("ddd, MMM D, YYYY")}
      </Text>
      {metrics.map((m) => (
        <div key={m.key} className={classes.tooltipRow}>
          <span className={classes.tooltipLabel}>
            <span className={classes.dot} style={{ background: m.color }} />
            {m.short}
          </span>
          <span className={classes.tooltipValue}>{m.format(point[m.key])}</span>
        </div>
      ))}
    </div>
  );
}

function tickFormat(metric: MetricDef) {
  return (v: number) =>
    metric.key === "ctr" ? `${(v * 100).toFixed(1)}%` : metric.key === "position" ? v.toFixed(0) : metric.format(v);
}

export function SearchPerformanceChart({
  daily,
  selected,
}: {
  daily: SearchPerformance["daily"];
  selected: MetricKey[];
}) {
  const metrics = METRICS.filter((m) => selected.includes(m.key));
  const single = metrics.length === 1;
  const axisTick = { fontSize: 11, fill: "var(--muted)" };

  return (
    <div className={classes.chart}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={daily} margin={{ top: 8, right: 8, left: single ? -8 : 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
            tickFormatter={(d: string) => dayjs(d).format("MMM D")}
          />
          {metrics.map((m) => (
            <YAxis
              key={m.key}
              yAxisId={m.key}
              hide={!single}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              width={48}
              reversed={m.lowerIsBetter}
              allowDecimals={m.key === "ctr" || m.key === "position"}
              domain={m.lowerIsBetter ? ["dataMin", "dataMax"] : [0, "auto"]}
              tickFormatter={tickFormat(m)}
            />
          ))}
          <Tooltip content={<ChartTooltip metrics={metrics} />} cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }} />
          {metrics.map((m) => (
            <Line
              key={m.key}
              yAxisId={m.key}
              type="monotone"
              dataKey={m.key}
              stroke={m.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: m.color, stroke: "var(--surface)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
