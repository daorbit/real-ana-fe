import type { CSSProperties } from "react";
import { Tooltip } from "@mantine/core";
import { num } from "@/shared/lib";
import classes from "./userDetail.module.css";

function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function UserActivityChart({ trend, total }: { trend: { date: string; events: number }[]; total: number }) {
  const max = Math.max(1, ...trend.map((d) => d.events));
  const activeDays = trend.filter((d) => d.events > 0).length;

  return (
    <div className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>Events · last 30 days</span>
        <span className={classes.eyebrow}>
          {activeDays} active {activeDays === 1 ? "day" : "days"}
        </span>
      </div>
      <div className={classes.hero}>{num(total)}</div>
      <div className={classes.heroNote}>Across every site in every workspace they belong to</div>

      <div className={classes.chart} role="img" aria-label={`${num(total)} events over the last 30 days`}>
        {trend.map((day) => (
          <Tooltip key={day.date} label={`${dayLabel(day.date)} · ${num(day.events)} events`} withArrow openDelay={50}>
            <div className={classes.barHit}>
              <div
                className={classes.bar}
                data-empty={day.events === 0 || undefined}
                style={{ "--h": `${(day.events / max) * 100}%` } as CSSProperties}
              />
            </div>
          </Tooltip>
        ))}
      </div>
      <div className={classes.axis}>
        <span>{trend.length ? dayLabel(trend[0].date) : ""}</span>
        <span>Today</span>
      </div>
    </div>
  );
}
