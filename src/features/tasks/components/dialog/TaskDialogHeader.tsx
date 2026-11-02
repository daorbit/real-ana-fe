import { ActionIcon, Menu } from "@mantine/core";
import { Check, ChevronRight, MoreHorizontal, Trash2, X } from "lucide-react";
import { taskKey } from "../../lib/board";
import type { Task } from "../../types";
import classes from "./TaskDialog.module.css";

export function TaskDialogHeader({
  planName,
  bucketName,
  task,
  canEdit,
  done,
  onToggleDone,
  onDelete,
  onClose,
}: {
  planName: string;
  bucketName: string | null;
  task: Task | null;
  canEdit: boolean;
  done: boolean;
  onToggleDone: () => void;
  onDelete: (task: Task) => void;
  onClose: () => void;
}) {
  return (
    <header className={classes.header}>
      <span className={classes.plan}>{planName}</span>
      {bucketName && (
        <>
          <ChevronRight size={12} className={classes.crumbSep} aria-hidden />
          <span className={classes.crumb}>{bucketName}</span>
        </>
      )}
      <span className={classes.keyChip}>{task ? taskKey(task.key) : "New task"}</span>
      <span className={classes.headerEnd}>
        {task && canEdit && (
          <Menu position="bottom-end" width={200}>
            <Menu.Target>
              <ActionIcon className={classes.roundButton} variant="subtle" color="gray" radius="xl" aria-label="More actions">
                <MoreHorizontal size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Check size={14} />} onClick={onToggleDone}>
                {done ? "Mark as not done" : "Mark as done"}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item className="danger-item" leftSection={<Trash2 size={14} />} onClick={() => onDelete(task)}>
                Delete task
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
        <ActionIcon className={classes.roundButton} variant="subtle" color="gray" radius="xl" onClick={onClose} aria-label="Close">
          <X size={15} />
        </ActionIcon>
      </span>
    </header>
  );
}
