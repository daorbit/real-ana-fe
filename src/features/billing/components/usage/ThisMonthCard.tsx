import type { CSSProperties } from "react";
import { Badge, Text } from "@mantine/core";
import { CalendarClock, Layers, ShoppingCart } from "lucide-react";
import { compact, num } from "@/shared/lib";
import type { UsageHistoryMonth } from "@/shared/types";
import { daysUntil, monthLabel, usageShare } from "../../lib/usageMonth";
import classes from "./UsageOverview.module.css";

function meterState(share: number): "over" | "near" | undefined {
  if (share >= 100) return "over";
  if (share >= 80) return "near";
  return undefined;
}

export function ThisMonthCard({ month, resetsAt }: { month: UsageHistoryMonth; resetsAt: string }) {
  const share = usageShare(month.events, month.eventQuota);
  const days = daysUntil(resetsAt);
  const resetDate = new Date(resetsAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  return (
    <section className={classes.hero}>
      <div>
        <Text className={classes.eyebrow}>Events this month · {monthLabel(month.month, "long")}</Text>
        <div className={classes.heroValue}>
          <span className={classes.heroNumber}>{num(month.events)}</span>
          <span className={classes.heroQuota}>
            of {compact(month.eventQuota)} on {month.plan.name}
          </span>
        </div>
        <div
          className={classes.meter}
          role="progressbar"
          aria-valuenow={Math.round(share)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Share of this month's event allowance used"
        >
          <span
            className={classes.meterFill}
            data-state={meterState(share)}
            style={{ "--share": `${share}%` } as CSSProperties}
          />
        </div>
        <div className={classes.heroMeta}>
          <span>
            <CalendarClock size={13} />
            Resets {resetDate} · {days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`}
          </span>
          <span>
            {Math.round(share)}% used
            {share >= 100 && (
              <Badge size="xs" color="red" variant="light">
                Limit reached
              </Badge>
            )}
          </span>
        </div>
      </div>

      <div className={classes.carry}>
        <div className={classes.carryRow}>
          <span className={classes.carryIcon}>
            <CalendarClock size={14} />
          </span>
          <span>
            <b>Usage is counted per calendar month.</b> Every meter starts again on the 1st (UTC), whatever your
            billing cycle.
          </span>
        </div>
        <div className={classes.carryRow}>
          <span className={classes.carryIcon}>
            <Layers size={14} />
          </span>
          <span>
            <b>Buying a plan keeps this month's count.</b> Upgrade or renew and the new limit applies straight away to
            what you've already used.
          </span>
        </div>
        <div className={classes.carryRow}>
          <span className={classes.carryIcon}>
            <ShoppingCart size={14} />
          </span>
          <span>
            <b>Add-on credits never expire.</b> They're only used once the month's plan allowance runs out.
          </span>
        </div>
      </div>
    </section>
  );
}
