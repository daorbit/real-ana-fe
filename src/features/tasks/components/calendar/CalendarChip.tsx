import { UnstyledButton } from "@mantine/core";
import { useDraggable } from "@dnd-kit/core";
import { dueState } from "../../lib/board";
import type { Task } from "../../types";
import classes from "./Calendar.module.css";

export function CalendarChipView({ task }: { task: Task }) {
  return (
    <>
      <span className={classes.chipMark} data-status={task.status} />
      <span className={classes.chipTitle}>{task.title}</span>
    </>
  );
}

export function CalendarChip({ task, canEdit, onOpen }: { task: Task; canEdit: boolean; onOpen: (task: Task) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id, disabled: !canEdit });

  return (
    <UnstyledButton
      ref={setNodeRef}
      className={classes.chip}
      data-state={dueState(task.dueDate, task.status) ?? undefined}
      data-done={task.status === "done" || undefined}
      data-dragging={isDragging || undefined}
      onClick={(event) => {
        event.stopPropagation();
        onOpen(task);
      }}
      {...attributes}
      {...listeners}
    >
      <CalendarChipView task={task} />
    </UnstyledButton>
  );
}
