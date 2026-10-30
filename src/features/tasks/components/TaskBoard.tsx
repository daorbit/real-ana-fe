import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import type { WorkspaceMember } from "@/shared/types";
import { buildColumns, groupTasks, orderAt, topOf } from "../lib/board";
import type { GroupBy, Task, TaskPatch } from "../types";
import { BoardColumn } from "./BoardColumn";
import classes from "./Tasks.module.css";

const NO_TASKS: Task[] = [];

function columnOf(data: unknown): string | null {
  return (data as { column?: string } | undefined)?.column ?? null;
}

export function TaskBoard({
  tasks,
  allTasks,
  groupBy,
  members,
  memberMap,
  canEdit,
  creating,
  onCreate,
  onOpen,
  onMove,
  onToggleDone,
}: {
  tasks: Task[];
  allTasks: Task[];
  groupBy: GroupBy;
  members: WorkspaceMember[];
  memberMap: Map<string, WorkspaceMember>;
  canEdit: boolean;
  creating: boolean;
  onCreate: (title: string, patch: TaskPatch) => Promise<boolean>;
  onOpen: (task: Task) => void;
  onMove: (task: Task, patch: TaskPatch) => void;
  onToggleDone: (task: Task) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const columns = useMemo(() => buildColumns(allTasks, groupBy, members), [allTasks, groupBy, members]);
  const groups = useMemo(() => groupTasks(tasks, groupBy), [tasks, groupBy]);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const onDragOver = ({ over }: DragOverEvent) => setOverColumn(columnOf(over?.data.current));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setOverColumn(null);
    const task = tasks.find((t) => t.id === active.id);
    const target = columns.find((c) => c.key === columnOf(over?.data.current));
    if (!task || !over || !target || over.id === active.id) return;

    const list = (groups.get(target.key) ?? NO_TASKS).filter((t) => t.id !== task.id);
    const overIndex = list.findIndex((t) => t.id === over.id);
    const index = overIndex >= 0 ? overIndex : list.length;
    const original = groups.get(target.key) ?? NO_TASKS;
    if (original[index]?.id === task.id) return;
    onMove(task, { ...target.patch, order: orderAt(list, index) });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setOverColumn(null)}
    >
      <div className={classes.boardScroll}>
        <div className={classes.board}>
          {columns.map((column) => (
            <BoardColumn
              key={column.key}
              column={column}
              tasks={groups.get(column.key) ?? NO_TASKS}
              splitCompleted={groupBy !== "progress"}
              highlighted={overColumn === column.key}
              members={memberMap}
              canEdit={canEdit}
              creating={creating}
              onCreate={(title) => onCreate(title, { ...column.patch, order: topOf(groups.get(column.key) ?? NO_TASKS) })}
              onOpen={onOpen}
              onToggleDone={onToggleDone}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
