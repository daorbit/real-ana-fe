import type { CSSProperties, ReactNode } from "react";
import { Tooltip } from "@mantine/core";
import { Check, Info } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { MetricTileChange } from "@/shared/lib/metricChange";
import classes from "@/shared/ui/MetricTile.module.css";

export function MetricTile({
  id,
  label,
  color,
  value,
  change,
  spark,
  sparkKey,
  hint,
  live,
  tinted,
  active,
  onToggle,
  extra,
}: {
  id: string;
  label: string;
  color: string;
  value: string;
  change: MetricTileChange | null;
  spark?: Record<string, number | string>[];
  sparkKey: string;
  hint?: string;
  live?: boolean;
  tinted?: boolean;
  active?: boolean;
  onToggle?: () => void;
  extra?: ReactNode;
}) {
  const selectable = Boolean(onToggle);
  const gradientId = `tile-spark-${id}`;

  return (
    <div
      role={selectable ? "checkbox" : undefined}
      tabIndex={selectable ? 0 : undefined}
      aria-checked={selectable ? Boolean(active) : undefined}
      aria-label={selectable ? `${label}: ${value}. Show on chart` : undefined}
      className={classes.tile}
      data-static={!selectable || undefined}
      data-tinted={tinted || undefined}
      style={{ "--metric": color } as CSSProperties}
      onClick={(e) => {
        if (!onToggle || (e.target as HTMLElement).closest("button, a")) return;
        onToggle();
      }}
      onKeyDown={(e) => {
        if (onToggle && e.target === e.currentTarget && (e.key === " " || e.key === "Enter")) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className={classes.body}>
        <div className={classes.head}>
          {live ? (
            <span className={classes.liveDot} aria-hidden />
          ) : (
            <span className={classes.swatch} aria-hidden>
              <Check size={10} strokeWidth={3.5} />
            </span>
          )}
          <span className={classes.label}>{label}</span>
          {hint && (
            <Tooltip label={hint} multiline w={240} withArrow events={{ hover: true, focus: true, touch: true }}>
              <Info size={13} className={classes.hint} aria-label={hint} />
            </Tooltip>
          )}
          {extra}
        </div>

        <div className={classes.valueRow}>
          <span className={classes.value}>{value}</span>
          {change && (
            <span className={classes.delta} data-bad={!change.good || undefined} data-flat={change.flat || undefined}>
              {change.text}
            </span>
          )}
        </div>
        <div className={classes.vs}>{change ? "vs previous period" : live ? "on the site right now" : " "}</div>
      </div>

      <div className={classes.spark} aria-hidden>
        {spark && spark.length > 1 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={sparkKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
