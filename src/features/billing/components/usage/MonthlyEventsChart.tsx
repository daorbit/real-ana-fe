import { Text } from "@mantine/core";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compact, num } from "@/shared/lib";
import type { UsageHistoryMonth } from "@/shared/types";
import { monthLabel, monthTick } from "../../lib/usageMonth";
import classes from "./UsageOverview.module.css";

const AXIS_TICK = { fill: "var(--text-2)", fontSize: 11 };

type Point = UsageHistoryMonth & { tick: string };

function MonthTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: Point }> }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className={classes.tooltip}>
      <div className={classes.tooltipTitle}>
        {monthLabel(point.month, "long")}
        {point.current ? " · so far" : ""}
      </div>
      <div className={classes.tooltipRow}>
        <span>Events</span>
        <span className={classes.tooltipValue}>{num(point.events)}</span>
      </div>
      <div className={classes.tooltipRow}>
        <span>{point.plan.name} limit</span>
        <span className={classes.tooltipValue}>{num(point.eventQuota)}</span>
      </div>
    </div>
  );
}

export function MonthlyEventsChart({ months }: { months: UsageHistoryMonth[] }) {
  const points: Point[] = [...months].reverse().map((m) => ({ ...m, tick: monthTick(m.month) }));

  return (
    <section className={classes.card}>
      <header className={classes.cardHead}>
        <div>
          <Text fw={650} size="sm">
            Events by month
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Tracked events counted against each month's plan. The current month is highlighted.
          </Text>
        </div>
      </header>
      <div className={classes.chartBody}>
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <BarChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: -8 }} barCategoryGap="28%">
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="tick" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={44}
              allowDecimals={false}
              tickFormatter={compact}
            />
            <Tooltip cursor={{ fill: "var(--surface-2)" }} content={<MonthTooltip />} isAnimationActive={false} />
            <Bar dataKey="events" radius={[4, 4, 0, 0]} maxBarSize={44} animationDuration={500}>
              {points.map((p) => (
                <Cell
                  key={p.month}
                  fill={p.current ? "var(--accent)" : "color-mix(in srgb, var(--accent) 42%, var(--surface))"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
