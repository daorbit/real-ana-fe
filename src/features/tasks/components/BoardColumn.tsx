import { useState } from "react";
import { UnstyledButton } from "@mantine/core";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { WorkspaceMember } from "@/shared/types";
import { MULTIPLE_ASSIGNEES, type BoardColumn as Column } from "../lib/board";
import type { Task } from "../types";
import { BucketHeader } from "./BucketHeader";
import { InlineCreate } from "./InlineCreate";
import { PriorityIcon, ProgressGlyph } from "./TaskBits";
import { TaskCard } from "./TaskCard";
import classes from "./Tasks.module.css";

export function BoardColumn({
  column,
  ids,
  openTotal,
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
  onSetBucketLimit,
  onDeleteBucket,
  compact = false,
}: {
  column: Column;
  ids: string[];
  openTotal: number;
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
  onSetBucketLimit: (limit: number | null) => void;
  onDeleteBucket: () => void;
  compact?: boolean;
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
      assignees={task.assigneeIds.map((id) => members.get(id)).filter((member): member is WorkspaceMember => Boolean(member))}
      canEdit={canEdit}
      onOpen={onOpen}
      onToggleDone={onToggleDone}
    />
  );

  const bucketHeader = column.bucket && (
    <BucketHeader
      name={column.title}
      count={open.length}
      total={openTotal}
      limit={column.bucket.limit}
      compact={compact}
      canEdit={canEdit}
      canDelete={canDeleteBucket}
      onRename={onRenameBucket}
      onSetLimit={onSetBucketLimit}
      onDelete={onDeleteBucket}
    />
  );
  const create = canEdit && column.key !== MULTIPLE_ASSIGNEES && <InlineCreate busy={creating} onCreate={onCreate} />;

  return (
    <section ref={setNodeRef} className={classes.column} data-over={isOver || undefined} aria-label={column.title}>
      {compact ? (
        (create || bucketHeader) && (
          <div className={classes.columnBar}>
            {create}
            {bucketHeader}
          </div>
        )
      ) : (
        <>
          <header className={classes.columnHead}>
            {column.member && <UserAvatar src={column.member.avatarUrl} name={column.title} size={22} radius="xl" />}
            {column.status && (
              <span className={classes.progress} data-status={column.status}>
                <ProgressGlyph status={column.status} size={16} />
              </span>
            )}
            {column.priority && <PriorityIcon priority={column.priority} />}
            {bucketHeader || (
              <span className={classes.columnTitle}>
                {column.title} ({open.length})
              </span>
            )}
          </header>
          {create}
        </>
      )}

      <SortableContext items={visible.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className={classes.cards}>
          {open.length === 0 && completed.length > 0 && !showCompleted && (
            <div className={classes.allClear}>
              <CalendarCheck size={16} />
              All clear. Nice work.
            </div>
          )}
          {visible.length === 0 && completed.length === 0 && (
            <div className={classes.empty}>
              {canEdit && column.key !== MULTIPLE_ASSIGNEES ? "Drag tasks here" : "No tasks"}
            </div>
          )}
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
