import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { SERIES, type StateCounts } from "../../lib/charts";
import classes from "./Charts.module.css";

type SliceTip = { active?: boolean; payload?: { name?: string; value?: number; payload?: { key: string } }[] };

function SliceTooltip({ active, payload }: SliceTip) {
  const item = payload?.[0];
  if (!active || !item) return null;
  return (
    <div className={classes.tooltip}>
      <div className={classes.tooltipRow}>
        <span className={classes.swatch} data-series={item.payload?.key} />
        {item.name}
        <span className={classes.tooltipValue}>{item.value}</span>
      </div>
    </div>
  );
}

export function StatusDonut({ counts }: { counts: StateCounts }) {
  const slices = SERIES.map((s) => ({ key: s.key, name: s.label, value: counts[s.key], color: s.color })).filter(
    (s) => s.value > 0,
  );
  const left = counts.notStarted + counts.inProgress + counts.late;

  return (
    <div className={classes.donut}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius="72%"
            outerRadius="94%"
            paddingAngle={slices.length > 1 ? 1.5 : 0}
            cornerRadius={4}
            startAngle={90}
            endAngle={-270}
            stroke="var(--surface)"
            strokeWidth={2}
            animationDuration={600}
          >
            {slices.map((s) => (
              <Cell key={s.key} fill={s.color} />
            ))}
          </Pie>
          <Tooltip content={<SliceTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className={classes.donutCenter}>
        <span className={classes.donutValue}>{left.toLocaleString()}</span>
        <span className={classes.donutLabel}>{left === 1 ? "Task left" : "Tasks left"}</span>
      </div>
    </div>
  );
}
