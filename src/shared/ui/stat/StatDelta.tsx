import { Badge, Text, Tooltip } from "@mantine/core";
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
  if (delta === null) {
    return (
      <Text size="xs" c="dimmed" fw={500}>
        —
      </Text>
    );
  }

  const up = delta > 0;
  const flat = delta === 0;
  const good = inverse ? !up : up;
  const color = flat ? "gray" : good ? "teal" : "red";
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;

  const badge = (
    <Badge size="sm" variant="light" color={color} leftSection={<Icon size={10} />} className={classes.deltaTrigger}>
      {up ? "+" : ""}
      {delta}%
    </Badge>
  );

  if (!comparison) return badge;

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
      <span tabIndex={0}>{badge}</span>
    </Tooltip>
  );
}
