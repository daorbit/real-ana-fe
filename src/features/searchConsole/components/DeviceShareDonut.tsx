import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { compact } from "@/shared/lib";
import type { SearchBreakdownRow } from "@/shared/types";
import { deviceMeta } from "../deviceMeta";
import { SearchCardHead } from "./SearchSectionHead";
import classes from "./devices.module.css";

export function DeviceShareDonut({ rows }: { rows: SearchBreakdownRow[] }) {
  const total = rows.reduce((sum, r) => sum + r.clicks, 0);
  const useImpressions = total === 0;
  const valueOf = (r: SearchBreakdownRow) => (useImpressions ? r.impressions : r.clicks);
  const sum = rows.reduce((s, r) => s + valueOf(r), 0);

  return (
    <section className={classes.card}>
      <SearchCardHead
        title={`Share of ${useImpressions ? "impressions" : "clicks"}`}
        description="Which devices people search on before they click."
      />

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
          <span className={classes.donutValue}>{compact(sum)}</span>
          <span className={classes.donutLabel}>{useImpressions ? "impressions" : "clicks"}</span>
        </div>
      </div>

      <ul className={classes.legend}>
        {rows.map((r) => {
          const meta = deviceMeta(r.key);
          const share = sum ? (valueOf(r) / sum) * 100 : 0;
          return (
            <li key={r.key} className={classes.legendRow} data-device={meta.id}>
              <span className={classes.legendSwatch} aria-hidden />
              <span className={classes.legendName}>{meta.label}</span>
              <span className={classes.legendShare}>{share.toFixed(0)}%</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
