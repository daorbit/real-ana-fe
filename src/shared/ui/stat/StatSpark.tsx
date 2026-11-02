import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { num } from "@/shared/lib";
import classes from "@/shared/ui/stat/StatCard.module.css";

type SparkRow = Record<string, number | string>;

function SparkTip({
  active,
  payload,
  dataKey,
  format,
}: {
  active?: boolean;
  payload?: { payload: SparkRow }[];
  dataKey: string;
  format: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const value = Number(row[dataKey] ?? 0);
  return (
    <div className={classes.sparkTip}>
      {row.bucket !== undefined && <span className={classes.sparkTipBucket}>{String(row.bucket)}</span>}
      {format(value)}
    </div>
  );
}

export function StatSpark({
  data,
  dataKey,
  accent,
  syncId,
  format = num,
}: {
  data: SparkRow[];
  dataKey: string;
  accent: string;
  syncId?: string;
  format?: (value: number) => string;
}) {
  return (
    <div className={classes.spark}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} syncId={syncId} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Tooltip
            content={<SparkTip dataKey={dataKey} format={format} />}
            cursor={{ stroke: accent, strokeOpacity: 0.35, strokeWidth: 1 }}
            isAnimationActive={false}
            allowEscapeViewBox={{ x: false, y: true }}
            offset={8}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={accent}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={accent}
            fillOpacity={0.18}
            dot={false}
            activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2, fill: accent }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
