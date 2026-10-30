import { dueState, taskKey } from "../../lib/board";
import { dayDiff, isWeekend, shortDate } from "../../lib/dates";
import {
  arrowPath,
  BAR_HEIGHT,
  DAY_WIDTH,
  GROUP_HEIGHT,
  HEADER_HEIGHT,
  type TimelineLayout,
} from "../../lib/timeline";
import type { Task } from "../../types";
import classes from "./Timeline.module.css";

function barTitle(task: Task): string {
  const dates = [task.startDate, task.dueDate].filter((d): d is string => Boolean(d)).map(shortDate);
  return `${taskKey(task.key)} ${task.title}${dates.length ? ` · ${[...new Set(dates)].join(" – ")}` : ""}`;
}

export function TimelineChart({
  layout,
  days,
  from,
  onOpen,
}: {
  layout: TimelineLayout;
  days: Date[];
  from: Date;
  onOpen: (task: Task) => void;
}) {
  const todayIndex = dayDiff(from, new Date());

  return (
    <svg className={classes.svg} width={layout.width} height={layout.height} role="img" aria-label="Task timeline">
      <defs>
        <marker id="timeline-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" className={classes.arrowHead} />
        </marker>
      </defs>

      {days.map((date, i) => (
        <g key={date.toISOString()}>
          {isWeekend(date) && <rect className={classes.weekend} x={i * DAY_WIDTH} y={0} width={DAY_WIDTH} height={layout.height} />}
          {(i === 0 || date.getDate() === 1) && (
            <text className={classes.monthLabel} x={i * DAY_WIDTH + 6} y={16}>
              {date.toLocaleDateString(undefined, { month: "short" })}
            </text>
          )}
          <text className={classes.dayLabel} data-today={i === todayIndex || undefined} x={i * DAY_WIDTH + DAY_WIDTH / 2} y={34}>
            {date.getDate()}
          </text>
        </g>
      ))}
      <line className={classes.rule} x1={0} x2={layout.width} y1={HEADER_HEIGHT - 0.5} y2={HEADER_HEIGHT - 0.5} />

      {layout.groups.map((group) => (
        <rect key={group.bucket.id} className={classes.groupBand} x={0} y={group.y} width={layout.width} height={GROUP_HEIGHT} />
      ))}

      {todayIndex >= 0 && todayIndex < days.length && (
        <line
          className={classes.today}
          x1={todayIndex * DAY_WIDTH + DAY_WIDTH / 2}
          x2={todayIndex * DAY_WIDTH + DAY_WIDTH / 2}
          y1={HEADER_HEIGHT}
          y2={layout.height}
        />
      )}

      {layout.arrows.map((arrow) => (
        <path key={arrow.id} className={classes.arrow} d={arrowPath(arrow)} markerEnd="url(#timeline-arrow)" />
      ))}

      {layout.groups.flatMap((group) =>
        group.bars.map(({ task, x, width, y }) => (
          <rect
            key={task.id}
            className={classes.bar}
            data-status={task.status}
            data-state={dueState(task.dueDate, task.status) ?? undefined}
            x={x}
            y={y}
            width={Math.max(width, 8)}
            height={BAR_HEIGHT}
            rx={6}
            role="button"
            tabIndex={0}
            aria-label={barTitle(task)}
            onClick={() => onOpen(task)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(task)}
          >
            <title>{barTitle(task)}</title>
          </rect>
        )),
      )}
    </svg>
  );
}
