import { Text } from "@mantine/core";
import type { SearchBreakdownRow } from "@/shared/types";
import { METRICS } from "../searchMetrics";
import { deviceMeta } from "../deviceMeta";
import classes from "./devices.module.css";

function takeaway(rows: SearchBreakdownRow[]): string {
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
  if (!totalClicks || rows.length < 2) return "Compare how each device performs in Google Search.";
  const byClicks = [...rows].sort((a, b) => b.clicks - a.clicks)[0];
  const byCtr = [...rows].sort((a, b) => b.ctr - a.ctr)[0];
  const share = Math.round((byClicks.clicks / totalClicks) * 100);
  const lead = `${deviceMeta(byClicks.key).label} brings ${share}% of your clicks`;
  return byCtr.key === byClicks.key
    ? `${lead} and has the best click-through rate.`
    : `${lead}, but ${deviceMeta(byCtr.key).label.toLowerCase()} has the best click-through rate.`;
}

export function DeviceComparison({ rows }: { rows: SearchBreakdownRow[] }) {
  return (
    <section className={classes.card}>
      <header>
        <Text fw={650} size="sm">
          Device comparison
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {takeaway(rows)}
        </Text>
      </header>

      <div className={classes.metrics}>
        {METRICS.map((m) => {
          const values = rows.map((r) => r[m.key]);
          const max = Math.max(0, ...values);
          const positive = values.filter((v) => v > 0);
          const best = m.lowerIsBetter ? Math.min(...positive) : max;
          return (
            <div key={m.key} className={classes.metric}>
              <Text className={classes.metricLabel}>{m.label}</Text>
              {rows.map((r) => {
                const meta = deviceMeta(r.key);
                const value = r[m.key];
                const width = m.lowerIsBetter
                  ? value
                    ? Math.max(6, (best / value) * 100)
                    : 0
                  : max
                    ? Math.max(value ? 4 : 0, (value / max) * 100)
                    : 0;
                const isBest = value > 0 && value === best && rows.length > 1;
                return (
                  <div key={r.key} className={classes.bar} data-device={meta.id}>
                    <span className={classes.barName}>{meta.label}</span>
                    <span className={classes.barTrack}>
                      <span className={classes.barFill} style={{ width: `${width}%` }} />
                    </span>
                    <span className={classes.barValue} data-best={isBest || undefined}>
                      {m.format(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
