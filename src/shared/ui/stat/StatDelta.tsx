import { Tooltip } from "@mantine/core";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import classes from "@/shared/ui/stat/StatCard.module.css";

export type StatComparison = {
  previous: string;
  current: string;
  label: string;
};

export function StatDelta({
  delta,
  inverse,
  comparison,
}: {
  delta: number | null;
  inverse?: boolean;
  comparison?: StatComparison;
}) {
  if (delta === null) return <span className={classes.trend}>—</span>;

  const up = delta > 0;
  const flat = delta === 0;
  const good = inverse ? !up : up;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;

  const trend = (
    <span className={classes.trend} data-tone={flat ? undefined : good ? "good" : "bad"} tabIndex={comparison ? 0 : undefined}>
      <Icon size={13} strokeWidth={2.4} />
      {up ? "+" : ""}
      {delta}%
    </span>
  );

  if (!comparison) return trend;

  return (
    <Tooltip
      withArrow
      position="top"
      events={{ hover: true, focus: true, touch: true }}
      label={
        <span className={classes.deltaTip}>
          <span className={classes.deltaTipRow}>
            {comparison.previous}
            <span className={classes.deltaTipArrow}>→</span>
            {comparison.current}
          </span>
          <span className={classes.deltaTipNote}>vs {comparison.label}</span>
        </span>
      }
    >
      {trend}
    </Tooltip>
  );
}
