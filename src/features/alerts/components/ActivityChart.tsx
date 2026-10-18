import { Tooltip } from "@mantine/core";
import { dayLabel } from "@/features/alerts/lib/alertTime";
import type { AlertDay } from "@/features/alerts/types";
import classes from "@/features/alerts/components/Alerts.module.css";

const BAR = 8;
const GAP = 2;
const HEIGHT = 56;
const EMPTY_HEIGHT = 2;

function barPath(x: number, height: number): string {
  const top = HEIGHT - height;
  const r = Math.min(3, height / 2, BAR / 2);
  return `M${x},${HEIGHT}V${top + r}Q${x},${top} ${x + r},${top}H${x + BAR - r}Q${x + BAR},${top} ${x + BAR},${top + r}V${HEIGHT}Z`;
}

function tooltipLabel(day: AlertDay): string {
  const when = dayLabel(`${day.day}T12:00:00`);
  if (!day.count) return `No alerts · ${when}`;
  return `${day.count} ${day.count === 1 ? "alert" : "alerts"} · ${when}`;
}

export function ActivityChart({ days }: { days: AlertDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const width = days.length * (BAR + GAP) - GAP;
  const total = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className={classes.activity}>
      <div className={classes.activityHead}>
        <span className={classes.activityLabel}>Alerts in the last {days.length} days</span>
        <span className={classes.activityValue}>{total}</span>
      </div>
      <svg className={classes.chart} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={`${total} alerts in the last ${days.length} days`}>
        {days.map((day, i) => {
          const x = i * (BAR + GAP);
          const height = day.count ? Math.max(4, (day.count / max) * HEIGHT) : EMPTY_HEIGHT;
          return (
            <Tooltip key={day.day} label={tooltipLabel(day)} withArrow openDelay={60}>
              <g className={classes.day}>
                <rect className={classes.hit} x={x - GAP / 2} y={0} width={BAR + GAP} height={HEIGHT} />
                {day.count ? (
                  <path className={classes.bar} d={barPath(x, height)} />
                ) : (
                  <rect className={classes.barEmpty} x={x} y={HEIGHT - EMPTY_HEIGHT} width={BAR} height={EMPTY_HEIGHT} rx={1} />
                )}
              </g>
            </Tooltip>
          );
        })}
      </svg>
      <div className={classes.axis}>
        <span>{days.length ? dayLabel(`${days[0].day}T12:00:00`) : ""}</span>
        <span>Today</span>
      </div>
    </div>
  );
}
