import { useState } from "react";
import { UnstyledButton } from "@mantine/core";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronRight } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { WorkspaceMember } from "@/shared/types";
import type { BoardColumn as Column } from "../lib/board";
import type { Task } from "../types";
import { InlineCreate } from "./InlineCreate";
import { PriorityIcon, ProgressGlyph } from "./TaskBits";
import { TaskCard } from "./TaskCard";
import classes from "./Tasks.module.css";

export function BoardColumn({
  column,
  tasks,
  splitCompleted,
  highlighted,
  members,
  canEdit,
  creating,
  onCreate,
  onOpen,
  onToggleDone,
}: {
  column: Column;
  tasks: Task[];
  splitCompleted: boolean;
  highlighted: boolean;
  members: Map<string, WorkspaceMember>;
  canEdit: boolean;
  creating: boolean;
  onCreate: (title: string) => Promise<boolean>;
  onOpen: (task: Task) => void;
  onToggleDone: (task: Task) => void;
}) {
  const [showCompleted, setShowCompleted] = useState(false);
  const { setNodeRef } = useDroppable({ id: `column:${column.key}`, data: { column: column.key } });

  const open = splitCompleted ? tasks.filter((t) => t.status !== "done") : tasks;
  const completed = splitCompleted ? tasks.filter((t) => t.status === "done") : [];
  const visible = showCompleted ? [...open, ...completed] : open;

  const card = (task: Task) => (
    <TaskCard
      key={task.id}
      task={task}
      column={column.key}
      assignee={task.assigneeId ? members.get(task.assigneeId) : undefined}
      canEdit={canEdit}
      onOpen={onOpen}
      onToggleDone={onToggleDone}
    />
  );

  return (
    <section ref={setNodeRef} className={classes.column} data-over={highlighted || undefined} aria-label={column.title}>
      <header className={classes.columnHead}>
        {column.member && <UserAvatar src={column.member.avatarUrl} name={column.title} size={22} radius="xl" />}
        {column.status && (
          <span className={classes.progress} data-status={column.status}>
            <ProgressGlyph status={column.status} size={16} />
          </span>
        )}
        {column.priority && <PriorityIcon priority={column.priority} />}
        <span className={classes.columnTitle}>{column.title}</span>
        <span className={classes.columnCount}>{open.length}</span>
      </header>

      {canEdit && <InlineCreate busy={creating} onCreate={onCreate} />}

      <SortableContext items={visible.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className={classes.cards}>
          {open.length === 0 && !showCompleted ? (
            <div className={classes.empty}>{canEdit ? "Drop a task here" : "No tasks"}</div>
          ) : null}
          {open.map(card)}
          {completed.length > 0 && (
            <UnstyledButton className={classes.completedToggle} onClick={() => setShowCompleted((v) => !v)}>
              <ChevronRight size={14} className={classes.chevron} data-open={showCompleted || undefined} />
              {showCompleted ? "Hide completed" : `Show completed (${completed.length})`}
            </UnstyledButton>
          )}
          {showCompleted && completed.map(card)}
        </div>
      </SortableContext>
    </section>
  );
}
