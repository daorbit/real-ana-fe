import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compact, num } from "@/shared/lib";
import { CHART_PALETTE, type ChartItem } from "./chartPalette";
import classes from "./BioStats.module.css";

const AXIS_TICK = { fontSize: 11, fill: "var(--muted)" };

function shortLabel(label: string): string {
  return label.length > 12 ? `${label.slice(0, 11)}…` : label;
}

function ColumnTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartItem }[] }) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;
  return (
    <div className={classes.tooltip}>
      <span className={classes.tooltipDate}>{item.label}</span>
      <span className={classes.tooltipRow}>
        <span className={classes.tooltipLabel}>Total</span>
        <span className={classes.tooltipValue}>{num(item.value)}</span>
      </span>
      {item.note && (
        <span className={classes.tooltipRow}>
          <span className={classes.tooltipLabel}>Click-through</span>
          <span className={classes.tooltipValue}>{item.note}</span>
        </span>
      )}
    </div>
  );
}

export function ColumnChart({ items, limit = 8 }: { items: ChartItem[]; limit?: number }) {
  const data = items.slice(0, limit);

  return (
    <div className={classes.columnChart}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }} barCategoryGap="22%">
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} tickFormatter={shortLabel} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} allowDecimals={false} tickFormatter={compact} />
          <Tooltip cursor={{ fill: "color-mix(in srgb, var(--text) 4%, transparent)" }} content={<ColumnTooltip />} isAnimationActive={false} />
          <Bar dataKey="value" radius={[6, 6, 2, 2]} maxBarSize={36} animationDuration={500}>
            {data.map((item, i) => (
              <Cell key={item.id} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
