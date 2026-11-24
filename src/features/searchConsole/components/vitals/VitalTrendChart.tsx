import { Text } from "@mantine/core";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import { formatVital, type VitalMeta } from "@/features/seo/components/panels/performance/vitalMeta";
import { METRIC_BY_KEY } from "../../searchMetrics";
import classes from "../metrics.module.css";

type Point = { date: string; value: number | null };

const LINE_COLOR = METRIC_BY_KEY.impressions.color;
const AXIS_TICK = { fontSize: 11, fill: "var(--muted)" };

function TrendTooltip({
  active,
  payload,
  meta,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: Point }>;
  meta: VitalMeta;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className={classes.tooltip}>
      <Text size="xs" fw={600}>
        28 days to {dayjs(point.date).format("MMM D, YYYY")}
      </Text>
      <div className={classes.tooltipRow}>
        <span className={classes.tooltipLabel}>{meta.label}</span>
        <span className={classes.tooltipValue}>{formatVital(point.value, meta.unit)}</span>
      </div>
    </div>
  );
}

export function VitalTrendChart({ points, meta }: { points: Point[]; meta: VitalMeta }) {
  const highest = Math.max(...points.map((p) => p.value ?? 0));
  const ceiling = Math.max(highest * 1.1, meta.good * 1.2);

  return (
    <div className={classes.chart}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
            tickFormatter={(d: string) => dayjs(d).format("MMM D")}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={56}
            domain={[0, ceiling]}
            tickFormatter={(v: number) => formatVital(v, meta.unit)}
          />
          <ReferenceLine y={meta.good} stroke="var(--green)" strokeDasharray="4 4" />
          <ReferenceLine y={meta.poor} stroke="var(--red)" strokeDasharray="4 4" />
          <Tooltip content={<TrendTooltip meta={meta} />} cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={LINE_COLOR}
            strokeWidth={2}
            dot={false}
            connectNulls
            activeDot={{ r: 4, fill: LINE_COLOR, stroke: "var(--surface)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
