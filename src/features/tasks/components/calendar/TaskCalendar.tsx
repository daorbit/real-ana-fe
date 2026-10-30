import { useMemo, useState } from "react";
import { ActionIcon, Button } from "@mantine/core";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { WorkspaceMember } from "@/shared/types";
import { bucketKeyOf } from "../../lib/board";
import { firstOfMonth, monthGrid, monthTitle, moveToDay, shiftMonth, tasksByDueDay, WEEKDAYS } from "../../lib/calendar";
import { toDateField } from "../../lib/dates";
import type { Bucket, Task, TaskPatch } from "../../types";
import { TaskListGroup } from "../list/TaskListGroup";
import { TaskListRow } from "../list/TaskListRow";
import { CalendarChipView } from "./CalendarChip";
import { CalendarDay } from "./CalendarDay";
import listClasses from "../list/TaskList.module.css";
import classes from "./Calendar.module.css";

const NO_TASKS: Task[] = [];

function todayKey() {
  return toDateField(new Date().toISOString());
}

export function TaskCalendar({
  tasks,
  buckets,
  memberMap,
  canEdit,
  onOpen,
  onToggleDone,
  onMove,
}: {
  tasks: Task[];
  buckets: Bucket[];
  memberMap: Map<string, WorkspaceMember>;
  canEdit: boolean;
  onOpen: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onMove: (task: Task, patch: TaskPatch) => void;
}) {
  const [month, setMonth] = useState(() => firstOfMonth(new Date()));
  const [selected, setSelected] = useState(todayKey);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byDay = useMemo(() => tasksByDueDay(tasks), [tasks]);
  const days = useMemo(() => monthGrid(month), [month]);
  const undated = tasks.filter((t) => !t.dueDate && t.status !== "done").length;
  const today = todayKey();
  const active = activeId ? tasks.find((t) => t.id === activeId) : undefined;
  const selectedTasks = byDay.get(selected) ?? NO_TASKS;
  const bucketName = (task: Task) => buckets.find((b) => b.id === bucketKeyOf(task, buckets))?.name;

  const goToday = () => {
    setMonth(firstOfMonth(new Date()));
    setSelected(todayKey());
  };

  const onDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    setActiveId(null);
    const task = tasks.find((t) => t.id === dragged.id);
    const patch = task && over ? moveToDay(task, String(over.id)) : null;
    if (task && patch) {
      onMove(task, patch);
      setSelected(String(over!.id));
    }
  };

  return (
    <div className={classes.calendar}>
      <header className={classes.head}>
        <span className={classes.month}>{monthTitle(month)}</span>
        <span className={classes.nav}>
          <Button size="xs" variant="default" onClick={goToday}>
            Today
          </Button>
          <ActionIcon variant="subtle" color="gray" onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label="Previous month">
            <ChevronLeft size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="gray" onClick={() => setMonth((m) => shiftMonth(m, 1))} aria-label="Next month">
            <ChevronRight size={18} />
          </ActionIcon>
        </span>
      </header>

      <DndContext
        sensors={sensors}
        onDragStart={({ active: dragged }) => setActiveId(String(dragged.id))}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className={classes.grid} role="grid" aria-label={monthTitle(month)}>
          {WEEKDAYS.map((day) => (
            <span key={day} className={classes.weekday} role="columnheader">
              {day}
            </span>
          ))}
          {days.map((date) => {
            const key = toDateField(date.toISOString());
            return (
              <CalendarDay
                key={key}
                dayKey={key}
                date={date}
                tasks={byDay.get(key) ?? NO_TASKS}
                outside={date.getMonth() !== month.getMonth()}
                today={key === today}
                selected={key === selected}
                canEdit={canEdit}
                onSelect={setSelected}
                onOpen={onOpen}
              />
            );
          })}
        </div>
        <DragOverlay dropAnimation={null}>
          {active ? (
            <span className={classes.chip} data-overlay>
              <CalendarChipView task={active} />
            </span>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskListGroup
        title={new Date(`${selected}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        count={selectedTasks.length}
      >
        {selectedTasks.length ? (
          selectedTasks.map((task) => (
            <TaskListRow
              key={task.id}
              task={task}
              bucketName={bucketName(task)}
              memberMap={memberMap}
              canEdit={canEdit}
              onOpen={onOpen}
              onToggleDone={onToggleDone}
            />
          ))
        ) : (
          <span className={listClasses.empty}>Nothing due this day.</span>
        )}
      </TaskListGroup>

      {undated > 0 && (
        <span className={classes.note}>
          {undated} open {undated === 1 ? "task has" : "tasks have"} no due date, so {undated === 1 ? "it isn't" : "they aren't"} on the calendar.
        </span>
      )}
    </div>
  );
}
