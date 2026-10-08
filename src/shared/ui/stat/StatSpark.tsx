import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { num } from "@/shared/lib";
import classes from "@/shared/ui/stat/StatCard.module.css";

type SparkRow = Record<string, number | string>;

function SparkTip({
  active,
  payload,
  dataKey,
}: {
  active?: boolean;
  payload?: { payload: SparkRow }[];
  dataKey: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const value = Number(row[dataKey] ?? 0);
  return (
    <div className={classes.sparkTip}>
      {row.bucket !== undefined && <span className={classes.sparkTipBucket}>{String(row.bucket)}</span>}
      {num(value)}
    </div>
  );
}

export function StatSpark({
  data,
  dataKey,
  accent,
  id,
  syncId,
}: {
  data: SparkRow[];
  dataKey: string;
  accent: string;
  id: string;
  syncId?: string;
}) {
  return (
    <div className={classes.spark}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} syncId={syncId} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.22} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={<SparkTip dataKey={dataKey} />}
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
            fill={`url(#${id})`}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: accent }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
