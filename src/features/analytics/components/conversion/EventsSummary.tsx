import { compact } from "@/shared/lib";
import type { EventBucket } from "@/shared/types";
import { formatMoney } from "./formatMoney";
import classes from "./Conversion.module.css";

export function EventsSummary({ items, totalRevenue }: { items: EventBucket[]; totalRevenue: number }) {
  const fired = items.reduce((sum, i) => sum + i.count, 0);
  const best = items.reduce<EventBucket | null>(
    (top, i) => (!top || i.conversionRate > top.conversionRate ? i : top),
    null,
  );
  const earner = items.reduce<EventBucket | null>((top, i) => (!top || i.revenue > top.revenue ? i : top), null);

  return (
    <div className={classes.summary}>
      <div className={classes.stat}>
        <span className={classes.statLabel}>Events</span>
        <span className={classes.statValue}>{compact(fired)}</span>
        <span className={classes.statNote}>
          {items.length} {items.length === 1 ? "event type" : "event types"}
        </span>
      </div>
      <div className={classes.stat}>
        <span className={classes.statLabel}>Visitors who converted</span>
        <span className={classes.statValue}>{best ? compact(best.visitors) : "—"}</span>
        <span className={classes.statNote} title={best?.key}>{best ? `Sent ${best.key}` : "No events yet"}</span>
      </div>
      <div className={classes.stat}>
        <span className={classes.statLabel}>Conversion rate</span>
        <span className={classes.statValue}>{best ? `${best.conversionRate}%` : "—"}</span>
        <span className={classes.statNote}>{best ? `Visitors who sent ${best.key}` : "Share of visitors"}</span>
      </div>
      <div className={classes.stat}>
        <span className={classes.statLabel}>Revenue</span>
        <span className={classes.statValue} data-money={totalRevenue > 0 || undefined}>
          {formatMoney(totalRevenue)}
        </span>
        <span className={classes.statNote}>
          {earner && earner.revenue > 0 ? `From ${earner.key}` : "From the value prop on events"}
        </span>
      </div>
    </div>
  );
}
