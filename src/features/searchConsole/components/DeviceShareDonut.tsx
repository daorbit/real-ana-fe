import { Text } from "@mantine/core";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { num } from "@/shared/lib";
import type { SearchBreakdownRow } from "@/shared/types";
import { deviceMeta } from "../deviceMeta";
import { ClickChange } from "./SearchCells";
import classes from "./devices.module.css";

export function DeviceShareDonut({ rows }: { rows: SearchBreakdownRow[] }) {
  const total = rows.reduce((sum, r) => sum + r.clicks, 0);
  const useImpressions = total === 0;
  const valueOf = (r: SearchBreakdownRow) => (useImpressions ? r.impressions : r.clicks);
  const sum = rows.reduce((s, r) => s + valueOf(r), 0);

  return (
    <section className={classes.card}>
      <header>
        <Text fw={650} size="sm">
          Share of {useImpressions ? "impressions" : "clicks"}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          Which devices people search on before visiting.
        </Text>
      </header>

      <div className={classes.donut}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey={useImpressions ? "impressions" : "clicks"}
              nameKey="key"
              innerRadius="80%"
              outerRadius="100%"
              paddingAngle={rows.length > 1 ? 4 : 0}
              cornerRadius={6}
              stroke="none"
              isAnimationActive={false}
            >
              {rows.map((r) => (
                <Cell key={r.key} fill={deviceMeta(r.key).color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className={classes.donutCenter}>
          <span className={classes.donutValue}>{num(sum)}</span>
          <span className={classes.donutLabel}>{useImpressions ? "impressions" : "clicks"}</span>
        </div>
      </div>

      <ul className={classes.legend}>
        {rows.map((r) => {
          const meta = deviceMeta(r.key);
          const Icon = meta.icon;
          const share = sum ? (valueOf(r) / sum) * 100 : 0;
          return (
            <li key={r.key} className={classes.legendRow} data-device={meta.id}>
              <span className={classes.legendIcon}>
                <Icon size={15} />
              </span>
              <span className={classes.legendName}>{meta.label}</span>
              <span className={classes.legendShare}>{share.toFixed(0)}%</span>
              <span className={classes.legendChange}>
                <ClickChange clicks={r.clicks} previousClicks={r.previousClicks} />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
