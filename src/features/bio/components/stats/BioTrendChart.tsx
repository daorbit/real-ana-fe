import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import { BIO_METRICS, type BioChartPoint, type BioMetricDef, type BioMetricKey } from "@/features/bio/lib/bioMetrics";
import classes from "./BioStats.module.css";

const AXIS_TICK = { fontSize: 11, fill: "var(--muted)" };

function ChartTooltip({ active, payload, metrics }: { active?: boolean; payload?: { payload: BioChartPoint }[]; metrics: BioMetricDef[] }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className={classes.tooltip}>
      <span className={classes.tooltipDate}>{dayjs(point.date).format("ddd, MMM D, YYYY")}</span>
      {metrics.map((m) => (
        <span key={m.key} className={classes.tooltipRow}>
          <span className={classes.tooltipLabel}>
            <span className={classes.tooltipDot} data-metric={m.key} />
            {m.label}
          </span>
          <span className={classes.tooltipValue}>{m.format(point[m.key])}</span>
        </span>
      ))}
    </div>
  );
}

export function BioTrendChart({ points, selected }: { points: BioChartPoint[]; selected: BioMetricKey[] }) {
  const metrics = BIO_METRICS.filter((m) => selected.includes(m.key));
  const single = metrics.length === 1;

  return (
    <div className={classes.chart}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <LineChart data={points} margin={{ top: 8, right: 8, left: single ? -8 : 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={AXIS_TICK}
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
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={48}
              allowDecimals={m.key === "rate"}
              tickFormatter={(v: number) => m.format(v)}
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
