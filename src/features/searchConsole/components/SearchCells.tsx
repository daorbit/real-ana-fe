import { num } from "@/shared/lib";
import { positionTone, type MetricChange } from "../searchMetrics";
import classes from "./metrics.module.css";

export function ChangeText({ change }: { change: MetricChange | null }) {
  if (!change) return <span className={classes.changeNote}>—</span>;
  return (
    <span className={classes.change} data-good={change.good || undefined} data-flat={change.flat || undefined}>
      {change.text}
    </span>
  );
}

export function ClickDelta({ clicks, previousClicks }: { clicks: number; previousClicks: number | null }) {
  if (previousClicks === null) return <ChangeText change={{ text: "New", good: true, flat: false }} />;
  const delta = clicks - previousClicks;
  const change = { text: `${delta > 0 ? "+" : delta < 0 ? "−" : ""}${num(Math.abs(delta))}`, good: delta >= 0, flat: delta === 0 };
  return <ChangeText change={change} />;
}

export function PositionChip({ position }: { position: number }) {
  if (!position) return <span className={classes.position}>—</span>;
  return (
    <span className={classes.position} data-tone={positionTone(position)}>
      {position.toFixed(1)}
    </span>
  );
}

export function ShareBar({
  value,
  max,
  label,
  compact = false,
}: {
  value: number;
  max: number;
  label: string;
  compact?: boolean;
}) {
  const width = max ? Math.max(2, (value / max) * 100) : 0;
  return (
    <span className={classes.share} data-compact={compact || undefined}>
      <span className={classes.shareTrack} aria-hidden>
        <span className={classes.shareFill} style={{ width: `${width}%` }} />
      </span>
      <span className={classes.shareValue}>{label}</span>
    </span>
  );
}
