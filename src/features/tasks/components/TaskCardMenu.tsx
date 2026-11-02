import { ActionIcon, Menu } from "@mantine/core";
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import type { Task } from "../types";
import classes from "./Tasks.module.css";

export function TaskCardMenu({
  task,
  onOpen,
  onDelete,
}: {
  task: Task;
  onOpen: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <Menu position="bottom-end" width={170} withinPortal>
      <Menu.Target>
        <ActionIcon
          className={classes.cardMenu}
          variant="subtle"
          color="gray"
          size="sm"
          aria-label={`More actions for ${task.title}`}
        >
          <MoreHorizontal size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<SquarePen size={14} />} onClick={() => onOpen(task)}>
          Open task
        </Menu.Item>
        <Menu.Item className="danger-item" leftSection={<Trash2 size={14} />} onClick={() => onDelete(task)}>
          Delete task
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
