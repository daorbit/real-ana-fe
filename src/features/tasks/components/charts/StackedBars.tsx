import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SERIES, type ChartRow } from "../../lib/charts";
import { SeriesTooltip } from "./ChartParts";
import classes from "./Charts.module.css";

const TOP = SERIES[SERIES.length - 1].key;
const MAX_TICK = 12;

const shortName = (name: string) => (name.length > MAX_TICK ? `${name.slice(0, MAX_TICK - 1)}…` : name);

export function StackedBars({ rows, wide }: { rows: ChartRow[]; wide?: boolean }) {
  if (!rows.some((r) => r.total > 0)) return <div className={classes.empty}>No tasks yet</div>;

  return (
    <div className={wide ? classes.plotWide : classes.plot}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: -12 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
          <XAxis
            dataKey="name"
            interval={0}
            tickLine={false}
            axisLine={{ stroke: "var(--viz-grid)" }}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            tickFormatter={shortName}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} width={40} />
          <Tooltip content={<SeriesTooltip />} cursor={{ fill: "var(--viz-track)" }} />
          {SERIES.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stackId="tasks"
              fill={s.color}
              stroke="var(--surface)"
              strokeWidth={2}
              maxBarSize={wide ? 44 : 36}
              radius={s.key === TOP ? [4, 4, 0, 0] : 0}
              animationDuration={600}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
