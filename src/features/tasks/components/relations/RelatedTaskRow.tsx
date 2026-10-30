import { ActionIcon, UnstyledButton } from "@mantine/core";
import { X } from "lucide-react";
import { taskKey } from "../../lib/board";
import type { Task } from "../../types";
import { ProgressButton, ProgressGlyph } from "../TaskBits";
import classes from "../Tasks.module.css";

export function RelatedTaskRow({
  task,
  onOpen,
  onToggleDone,
  onRemove,
  removeLabel,
}: {
  task: Task;
  onOpen: (task: Task) => void;
  onToggleDone?: (task: Task) => void;
  onRemove?: (task: Task) => void;
  removeLabel?: string;
}) {
  return (
    <div className={classes.checkItem}>
      {onToggleDone ? (
        <ProgressButton status={task.status === "done" ? "done" : "todo"} onToggle={() => onToggleDone(task)} />
      ) : (
        <span className={classes.progress} data-status={task.status}>
          <ProgressGlyph status={task.status} size={18} />
        </span>
      )}
      <UnstyledButton className={classes.relatedOpen} onClick={() => onOpen(task)}>
        <span className={classes.key}>{taskKey(task.key)}</span>
        <span className={classes.checkText} data-done={task.status === "done" || undefined}>
          {task.title}
        </span>
      </UnstyledButton>
      {onRemove && (
        <ActionIcon
          className={classes.checkRemove}
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => onRemove(task)}
          aria-label={removeLabel ?? `Remove ${task.title}`}
        >
          <X size={14} />
        </ActionIcon>
      )}
    </div>
  );
}
