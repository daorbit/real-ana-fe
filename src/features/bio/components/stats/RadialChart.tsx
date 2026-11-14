import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { num } from "@/shared/lib";
import { CHART_PALETTE, type ChartItem } from "./chartPalette";
import classes from "./BioStats.module.css";

export function RadialChart({ items, limit = 5 }: { items: ChartItem[]; limit?: number }) {
  const top = items.slice(0, limit);
  const total = items.reduce((sum, i) => sum + i.value, 0);
  const max = Math.max(1, ...top.map((i) => i.value));
  const data = [...top].reverse().map((item, i, arr) => ({
    ...item,
    fill: CHART_PALETTE[(arr.length - 1 - i) % CHART_PALETTE.length],
  }));

  return (
    <div className={classes.radialWrap}>
      <div className={classes.radialChart}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart data={data} innerRadius="28%" outerRadius="100%" startAngle={90} endAngle={-270} barSize={9}>
            <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "color-mix(in srgb, var(--text) 6%, transparent)" }} animationDuration={700} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <ul className={classes.legend}>
        {top.map((item, i) => (
          <li key={item.id} className={classes.legendRow}>
            <span className={classes.legendDot} data-index={i % CHART_PALETTE.length} />
            <span className={classes.legendLabel}>{item.label}</span>
            <span className={classes.legendValue}>{num(item.value)}</span>
            <span className={classes.legendShare}>{total ? `${Math.round((item.value / total) * 100)}%` : "—"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
