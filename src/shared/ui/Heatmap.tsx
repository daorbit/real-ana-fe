import { Tooltip } from "@mantine/core";
import { CalendarClock, Inbox } from "lucide-react";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import type { HeatCell } from "@/shared/types";
import classes from "./Heatmap.module.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const LEVELS = 8;

function levelOf(count: number, max: number): number {
  if (count <= 0) return 0;
  return Math.max(1, Math.ceil((count / max) * LEVELS));
}

/**
 * When traffic actually happens, by weekday and hour.
 *
 * Colour is scaled against the busiest cell rather than an absolute number —
 * a site with 50 views a week and one with 50,000 should both show a readable
 * pattern, not a uniform block.
 */
export function Heatmap({ cells }: { cells: HeatCell[] }) {
  const max = Math.max(1, ...cells.map((c) => c.count));
  const byCell = new Map(cells.map((c) => [`${c.day}-${c.hour}`, c.count]));

  return (
    <RankCard title="When your visitors show up" icon={CalendarClock} tone="blue" fill={false}>
      {cells.length === 0 ? (
        <RankEmpty icon={Inbox}>Waiting for data…</RankEmpty>
      ) : (
        <div className={classes.scroll}>
          <div className={classes.grid}>
            {DAYS.map((day, d) => (
              <div key={day} className={classes.row}>
                <span className={classes.day}>{day}</span>
                {HOURS.map((h) => {
                  const count = byCell.get(`${d}-${h}`) ?? 0;
                  return (
                    <Tooltip
                      key={h}
                      label={`${day} ${String(h).padStart(2, "0")}:00 — ${count} view${count === 1 ? "" : "s"}`}
                      withArrow
                      openDelay={80}
                    >
                      <span className={classes.cell} data-level={levelOf(count, max)} />
                    </Tooltip>
                  );
                })}
              </div>
            ))}
            <div className={classes.row}>
              <span className={classes.day} />
              {HOURS.map((h) => (
                <span key={h} className={classes.hour}>
                  {h % 3 === 0 ? h : ""}
                </span>
              ))}
            </div>
          </div>
          <div className={classes.scale} aria-hidden>
            <span>Less</span>
            {Array.from({ length: LEVELS + 1 }, (_, l) => (
              <span key={l} className={classes.swatch} data-level={l} />
            ))}
            <span>More</span>
          </div>
        </div>
      )}
    </RankCard>
  );
}
