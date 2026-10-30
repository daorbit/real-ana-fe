import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { MoveHorizontal } from "lucide-react";
import type { WorkspaceMember } from "@/shared/types";
import { buildColumns, columnKeyOf, groupTasks, MULTIPLE_ASSIGNEES, orderAt, topOf } from "../lib/board";
import type { Bucket, GroupBy, Task, TaskPatch } from "../types";
import { AddBucket } from "./AddBucket";
import { BoardColumn } from "./BoardColumn";
import { TaskCardOverlay } from "./TaskCard";
import classes from "./Tasks.module.css";

type Items = Record<string, string[]>;

const CLICK_GUARD_MS = 250;

export function TaskBoard({
  tasks,
  allTasks,
  buckets,
  groupBy,
  members,
  memberMap,
  canEdit,
  creating,
  addingBucket,
  onCreate,
  onOpen,
  onMove,
  onToggleDone,
  onAddBucket,
  onRenameBucket,
  onDeleteBucket,
}: {
  tasks: Task[];
  allTasks: Task[];
  buckets: Bucket[];
  groupBy: GroupBy;
  members: WorkspaceMember[];
  memberMap: Map<string, WorkspaceMember>;
  canEdit: boolean;
  creating: boolean;
  addingBucket: boolean;
  onCreate: (title: string, patch: TaskPatch) => Promise<boolean>;
  onOpen: (task: Task) => void;
  onMove: (task: Task, patch: TaskPatch) => void;
  onToggleDone: (task: Task) => void;
  onAddBucket: (name: string) => Promise<boolean>;
  onRenameBucket: (bucket: Bucket, name: string) => void;
  onDeleteBucket: (bucket: Bucket) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const columns = useMemo(() => buildColumns(allTasks, groupBy, members, buckets), [allTasks, groupBy, members, buckets]);
  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const base = useMemo<Items>(() => {
    const groups = groupTasks(tasks, groupBy, buckets);
    return Object.fromEntries(columns.map((c) => [c.key, (groups.get(c.key) ?? []).map((t) => t.id)]));
  }, [tasks, groupBy, buckets, columns]);

  const [items, setItems] = useState<Items | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const droppedAt = useRef(0);
  const live = items ?? base;

  useEffect(() => {
    if (!activeId) setItems(null);
  }, [base]);

  const containerOf = (id: UniqueIdentifier, from: Items = live): string | undefined => {
    const key = String(id);
    if (key in from) return key;
    return Object.keys(from).find((k) => from[k].includes(key));
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    setItems(base);
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    setItems((prev) => {
      const current = prev ?? base;
      const from = containerOf(active.id, current);
      const to = containerOf(over.id, current);
      if (!from || !to || from === to) return current;
      if (groupBy === "assignee" && to === MULTIPLE_ASSIGNEES) return current;
      const target = current[to].filter((id) => id !== active.id);
      const overIndex = target.indexOf(String(over.id));
      target.splice(overIndex >= 0 ? overIndex : target.length, 0, String(active.id));
      return { ...current, [from]: current[from].filter((id) => id !== active.id), [to]: target };
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    droppedAt.current = Date.now();
    setActiveId(null);
    const task = taskMap.get(String(active.id));
    const to = over ? containerOf(over.id) : undefined;
    if (!task || !to) return setItems(null);

    let list = live[to];
    if (groupBy === "assignee" && to === MULTIPLE_ASSIGNEES && columnKeyOf(task, groupBy, buckets) !== to)
      return setItems(null);
    const oldIndex = list.indexOf(task.id);
    const overIndex = list.indexOf(String(over!.id));
    if (oldIndex >= 0 && overIndex >= 0 && oldIndex !== overIndex) list = arrayMove(list, oldIndex, overIndex);
    setItems((prev) => ({ ...(prev ?? base), [to]: list }));

    const index = list.indexOf(task.id);
    const neighbours = list.filter((id) => id !== task.id).map((id) => taskMap.get(id)!).filter(Boolean);
    const from = columnKeyOf(task, groupBy, buckets);
    if (from === to && base[to].indexOf(task.id) === index) return;

    const column = columns.find((c) => c.key === to);
    if (!column) return;
    onMove(task, { ...(from === to ? {} : column.patch), order: orderAt(neighbours, index) });
  };

  const open = (task: Task) => {
    if (Date.now() - droppedAt.current < CLICK_GUARD_MS) return;
    onOpen(task);
  };

  const active = activeId ? taskMap.get(activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setItems(null);
      }}
    >
      <div className={classes.boardHint}>
        <MoveHorizontal size={14} />
        Swipe to browse columns
      </div>
      <div className={classes.boardScroll} role="region" aria-label="Task board columns" tabIndex={0}>
        <div className={classes.board}>
          {columns.map((column) => (
            <BoardColumn
              key={column.key}
              column={column}
              ids={live[column.key] ?? []}
              taskMap={taskMap}
              splitCompleted={groupBy !== "progress"}
              members={memberMap}
              canEdit={canEdit}
              canDeleteBucket={buckets.length > 1}
              creating={creating}
              onCreate={(title) =>
                onCreate(title, { ...column.patch, order: topOf((live[column.key] ?? []).map((id) => taskMap.get(id)!).filter(Boolean)) })
              }
              onOpen={open}
              onToggleDone={onToggleDone}
              onRenameBucket={(name) => column.bucket && onRenameBucket(column.bucket, name)}
              onDeleteBucket={() => column.bucket && onDeleteBucket(column.bucket)}
            />
          ))}
          {groupBy === "bucket" && canEdit && <AddBucket busy={addingBucket} onAdd={onAddBucket} />}
        </div>
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
        {active ? (
          <TaskCardOverlay
            task={active}
            assignees={active.assigneeIds.map((id) => memberMap.get(id)).filter((member): member is WorkspaceMember => Boolean(member))}
            canEdit={false}
            onOpen={() => undefined}
            onToggleDone={() => undefined}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
