import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { num } from "@/shared/lib";
import { METRIC_BY_KEY, metricChange, positionTone, type MetricChange } from "../searchMetrics";
import classes from "./metrics.module.css";

export function ChangeText({ change, note }: { change: MetricChange | null; note?: string }) {
  if (!change) return <span className={classes.changeNote}>—</span>;
  return (
    <span className={classes.change} data-good={change.good || undefined} data-flat={change.flat || undefined}>
      {!change.flat && (change.good ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
      {change.text}
      {note && <span className={classes.changeNote}>&nbsp;{note}</span>}
    </span>
  );
}

export function ClickChange({ clicks, previousClicks }: { clicks: number; previousClicks: number | null }) {
  const change =
    previousClicks === null
      ? { text: "new", good: true, flat: false }
      : metricChange(METRIC_BY_KEY.clicks, clicks, previousClicks);
  return <ChangeText change={change} />;
}

export function ClickDelta({ clicks, previousClicks }: { clicks: number; previousClicks: number | null }) {
  const delta = clicks - (previousClicks ?? 0);
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

export function ShareBar({ value, max, label }: { value: number; max: number; label: string }) {
  const width = max ? Math.max(2, (value / max) * 100) : 0;
  return (
    <span className={classes.share}>
      <span className={classes.shareTrack} aria-hidden>
        <span className={classes.shareFill} style={{ width: `${width}%` }} />
      </span>
      {label}
    </span>
  );
}
