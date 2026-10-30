import { Tooltip, UnstyledButton } from "@mantine/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckSquare, Link2, NotebookText } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { WorkspaceMember } from "@/shared/types";
import { taskKey } from "../lib/board";
import type { Task } from "../types";
import { DueChip, LabelPill, PriorityIcon, ProgressButton, ProgressGlyph } from "./TaskBits";
import classes from "./Tasks.module.css";

const CARD_CHECK_ITEMS = 4;

export function TaskCard({
  task,
  column,
  assignee,
  canEdit,
  onOpen,
  onToggleDone,
}: {
  task: Task;
  column: string;
  assignee: WorkspaceMember | undefined;
  canEdit: boolean;
  onOpen: (task: Task) => void;
  onToggleDone: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !canEdit,
    data: { column },
  });
  const done = task.status === "done";
  const checked = task.checklist.filter((c) => c.done).length;

  return (
    <div
      ref={setNodeRef}
      className={classes.card}
      data-dragging={isDragging || undefined}
      data-done={done || undefined}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      {task.labels.length > 0 && (
        <div className={classes.labels}>
          {task.labels.map((l) => (
            <LabelPill key={l.text} label={l} />
          ))}
        </div>
      )}
      <div className={classes.titleRow}>
        <ProgressButton status={task.status} disabled={!canEdit} onToggle={() => onToggleDone(task)} />
        <UnstyledButton className={classes.cardOpen} onClick={() => onOpen(task)}>
          <span className={classes.cardTitle}>{task.title}</span>
        </UnstyledButton>
      </div>
      {task.checklistOnCard && task.checklist.length > 0 && (
        <div className={classes.cardChecklist}>
          {task.checklist.slice(0, CARD_CHECK_ITEMS).map((item) => (
            <span key={item.id} className={classes.cardCheckItem} data-done={item.done || undefined}>
              <span className={classes.progress} data-status={item.done ? "done" : "todo"}>
                <ProgressGlyph status={item.done ? "done" : "todo"} size={13} />
              </span>
              {item.text}
            </span>
          ))}
        </div>
      )}
      <div className={classes.cardFoot}>
        <span className={classes.key}>{taskKey(task.key)}</span>
        <PriorityIcon priority={task.priority} />
        {task.dueDate && <DueChip dueDate={task.dueDate} status={task.status} />}
        <span className={classes.footEnd}>
          {task.checklist.length > 0 && (
            <span className={classes.meta}>
              <CheckSquare size={13} />
              {checked}/{task.checklist.length}
            </span>
          )}
          {task.notes && (
            <Tooltip label="Has notes" withArrow>
              <span className={classes.meta}>
                <NotebookText size={13} />
              </span>
            </Tooltip>
          )}
          {task.link && (
            <span className={classes.meta}>
              <Link2 size={13} />
            </span>
          )}
          {assignee && (
            <Tooltip label={assignee.name || assignee.email} withArrow>
              <span>
                <UserAvatar src={assignee.avatarUrl} name={assignee.name || assignee.email} size={24} radius="xl" />
              </span>
            </Tooltip>
          )}
        </span>
      </div>
    </div>
  );
}
