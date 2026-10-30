import { useDroppable } from "@dnd-kit/core";
import type { Task } from "../../types";
import { CalendarChip } from "./CalendarChip";
import classes from "./Calendar.module.css";

const MAX_CHIPS = 3;

export function CalendarDay({
  dayKey,
  date,
  tasks,
  outside,
  today,
  selected,
  canEdit,
  onSelect,
  onOpen,
}: {
  dayKey: string;
  date: Date;
  tasks: Task[];
  outside: boolean;
  today: boolean;
  selected: boolean;
  canEdit: boolean;
  onSelect: (dayKey: string) => void;
  onOpen: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dayKey });
  const more = tasks.length - MAX_CHIPS;

  return (
    <div
      ref={setNodeRef}
      role="gridcell"
      tabIndex={0}
      aria-selected={selected}
      aria-label={`${date.toDateString()}, ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`}
      className={classes.day}
      data-outside={outside || undefined}
      data-today={today || undefined}
      data-selected={selected || undefined}
      data-over={isOver || undefined}
      onClick={() => onSelect(dayKey)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(dayKey)}
    >
      <span className={classes.dayNumber}>{date.getDate()}</span>
      <div className={classes.chips}>
        {tasks.slice(0, MAX_CHIPS).map((task) => (
          <CalendarChip key={task.id} task={task} canEdit={canEdit} onOpen={onOpen} />
        ))}
        {more > 0 && <span className={classes.more}>+{more} more</span>}
      </div>
      {tasks.length > 0 && (
        <span className={classes.dots} aria-hidden>
          {tasks.slice(0, MAX_CHIPS).map((task) => (
            <span key={task.id} className={classes.dot} data-status={task.status} />
          ))}
        </span>
      )}
    </div>
  );
}
