import { useState, type ReactNode } from "react";
import { Tooltip } from "@mantine/core";
import { Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCountUp } from "@/shared/hooks/useCountUp";
import { compact, num } from "@/shared/lib";
import { StatDelta } from "@/shared/ui/stat/StatDelta";
import type { StatComparison } from "@/shared/ui/stat/StatDelta";
import { StatSpark } from "@/shared/ui/stat/StatSpark";
import { StatExplanation, StatExplainButton } from "@/shared/ui/stat/StatExplain";
import classes from "@/shared/ui/stat/StatCard.module.css";

export type { StatComparison };

export const ACCENT: Record<string, string> = {
  emerald: "var(--viz-1)",
  violet: "var(--viz-7)",
  green: "var(--viz-3)",
  cyan: "var(--viz-2)",
  amber: "var(--viz-4)",
  pink: "var(--viz-5)",
  blue: "var(--metric-blue)",
  orange: "var(--metric-orange)",
  purple: "var(--metric-purple)",
  rose: "var(--metric-pink)",
  teal: "var(--metric-teal)",
  indigo: "var(--metric-indigo)",
  yellow: "var(--metric-yellow)",
};

const COMPACT_FROM = 1_000;

function StatValue({ value }: { value: number | string }) {
  const numeric = typeof value === "number";
  const counted = useCountUp(numeric ? value : 0);
  if (!numeric) return <>{value}</>;
  const rounded = Math.round(counted);
  if (value < COMPACT_FROM) return <>{num(rounded)}</>;
  return (
    <Tooltip label={num(value)} withArrow position="top-start">
      <span>{compact(rounded)}</span>
    </Tooltip>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color = "emerald",
  live,
  delta,
  inverseDelta,
  comparison,
  note,
  spark,
  sparkKey = "views",
  sparkFormat,
  syncId,
  hint,
  onExplain,
  explaining,
  explanation,
  explainError,
  footer,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: keyof typeof ACCENT | string;
  live?: boolean;
  delta?: number | null;
  inverseDelta?: boolean;
  comparison?: StatComparison;
  note?: string;
  spark?: Record<string, number | string>[];
  sparkKey?: string;
  sparkFormat?: (value: number) => string;
  syncId?: string;
  hint?: string;
  onExplain?: () => void;
  explaining?: boolean;
  explanation?: string | null;
  explainError?: string | null;
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const accent = ACCENT[color] ?? ACCENT.emerald;
  const hasSpark = Boolean(spark && spark.length > 1 && spark.some((row) => typeof row[sparkKey] === "number"));
  const subline = note ?? (comparison ? `vs ${comparison.previousShort} · ${comparison.label}` : null);

  const toggleExplain = () => {
    const opening = !open;
    setOpen(opening);
    if (opening) onExplain?.();
  };

  return (
    <div className="stat-card">
      <div className={`stat-card-body ${classes.body}`}>
        <div className={classes.head}>
          <Icon size={16} className={classes.icon} />
          <span className={classes.label}>{label}</span>
          {hint && (
            <Tooltip label={hint} multiline w={240} withArrow events={{ hover: true, focus: true, touch: true }}>
              <Info size={14} className={`stat-hint ${classes.hint}`} />
            </Tooltip>
          )}
          <span className={classes.spacer} />
          {live ? (
            <span className={classes.live}>
              <span className={classes.liveDot} aria-hidden />
              Live
            </span>
          ) : delta !== undefined ? (
            <StatDelta delta={delta} inverse={inverseDelta} comparison={comparison} />
          ) : null}
          {onExplain && <StatExplainButton open={open} explaining={explaining} onToggle={toggleExplain} />}
        </div>

        <div className={`stat-card-value ${classes.value}`}>
          <StatValue value={value} />
        </div>
        {subline && <span className={classes.subline}>{subline}</span>}
        {open && (
          <StatExplanation explaining={explaining} explanation={explanation} explainError={explainError} />
        )}
      </div>

      {hasSpark && spark && (
        <StatSpark data={spark} dataKey={sparkKey} accent={accent} syncId={syncId} format={sparkFormat} />
      )}
      {footer && <div className={classes.footer}>{footer}</div>}
    </div>
  );
}
