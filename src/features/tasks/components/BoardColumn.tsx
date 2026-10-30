import { useState } from "react";
import { UnstyledButton } from "@mantine/core";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronRight } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { WorkspaceMember } from "@/shared/types";
import type { BoardColumn as Column } from "../lib/board";
import type { Task } from "../types";
import { BucketHeader } from "./BucketHeader";
import { InlineCreate } from "./InlineCreate";
import { PriorityIcon, ProgressGlyph } from "./TaskBits";
import { TaskCard } from "./TaskCard";
import classes from "./Tasks.module.css";

export function BoardColumn({
  column,
  ids,
  taskMap,
  splitCompleted,
  members,
  canEdit,
  canDeleteBucket,
  creating,
  onCreate,
  onOpen,
  onToggleDone,
  onRenameBucket,
  onDeleteBucket,
}: {
  column: Column;
  ids: string[];
  taskMap: Map<string, Task>;
  splitCompleted: boolean;
  members: Map<string, WorkspaceMember>;
  canEdit: boolean;
  canDeleteBucket: boolean;
  creating: boolean;
  onCreate: (title: string) => Promise<boolean>;
  onOpen: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onRenameBucket: (name: string) => void;
  onDeleteBucket: () => void;
}) {
  const [showCompleted, setShowCompleted] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: column.key });

  const tasks = ids.map((id) => taskMap.get(id)).filter((t): t is Task => Boolean(t));
  const open = splitCompleted ? tasks.filter((t) => t.status !== "done") : tasks;
  const completed = splitCompleted ? tasks.filter((t) => t.status === "done") : [];
  const visible = showCompleted ? [...open, ...completed] : open;

  const card = (task: Task) => (
    <TaskCard
      key={task.id}
      task={task}
      assignee={task.assigneeId ? members.get(task.assigneeId) : undefined}
      canEdit={canEdit}
      onOpen={onOpen}
      onToggleDone={onToggleDone}
    />
  );

  return (
    <section ref={setNodeRef} className={classes.column} data-over={isOver || undefined} aria-label={column.title}>
      <header className={classes.columnHead}>
        {column.member && <UserAvatar src={column.member.avatarUrl} name={column.title} size={22} radius="xl" />}
        {column.status && (
          <span className={classes.progress} data-status={column.status}>
            <ProgressGlyph status={column.status} size={16} />
          </span>
        )}
        {column.priority && <PriorityIcon priority={column.priority} />}
        {column.bucket ? (
          <BucketHeader
            name={column.title}
            count={open.length}
            canEdit={canEdit}
            canDelete={canDeleteBucket}
            onRename={onRenameBucket}
            onDelete={onDeleteBucket}
          />
        ) : (
          <span className={classes.columnTitle}>
            {column.title} ({open.length})
          </span>
        )}
      </header>

      {canEdit && <InlineCreate busy={creating} onCreate={onCreate} />}

      <SortableContext items={visible.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className={classes.cards}>
          {visible.length === 0 && <div className={classes.empty}>{canEdit ? "Drag tasks here" : "No tasks"}</div>}
          {open.map(card)}
          {completed.length > 0 && (
            <UnstyledButton className={classes.completedToggle} onClick={() => setShowCompleted((v) => !v)}>
              <ChevronRight size={14} className={classes.chevron} data-open={showCompleted || undefined} />
              {showCompleted ? "Hide completed" : `Completed tasks (${completed.length})`}
            </UnstyledButton>
          )}
          {showCompleted && completed.map(card)}
        </div>
      </SortableContext>
    </section>
  );
}
