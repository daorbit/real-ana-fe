import { UnstyledButton } from "@mantine/core";
import { Lock } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { WorkspaceMember } from "@/shared/types";
import { taskKey } from "../../lib/board";
import { openBlockers } from "../../lib/relations";
import { useTaskIndex } from "../../hooks/TaskIndexContext";
import type { Task } from "../../types";
import { DueChip, PriorityIcon, ProgressButton } from "../TaskBits";
import classes from "./TaskList.module.css";

export function TaskListRow({
  task,
  bucketName,
  memberMap,
  canEdit,
  onOpen,
  onToggleDone,
}: {
  task: Task;
  bucketName?: string;
  memberMap: Map<string, WorkspaceMember>;
  canEdit: boolean;
  onOpen: (task: Task) => void;
  onToggleDone: (task: Task) => void;
}) {
  const index = useTaskIndex();
  const blocked = openBlockers(index, task).length > 0;
  const assignees = task.assigneeIds.map((id) => memberMap.get(id)).filter((m): m is WorkspaceMember => Boolean(m));

  return (
    <div className={classes.row} data-done={task.status === "done" || undefined}>
      <ProgressButton status={task.status === "done" ? "done" : "todo"} disabled={!canEdit} onToggle={() => onToggleDone(task)} />
      <UnstyledButton className={classes.open} onClick={() => onOpen(task)}>
        <span className={classes.title}>{task.title}</span>
        <span className={classes.sub}>
          <span className={classes.key}>{taskKey(task.key)}</span>
          {bucketName && <span>{bucketName}</span>}
          {blocked && (
            <span className={classes.blocked}>
              <Lock size={11} />
              Blocked
            </span>
          )}
        </span>
      </UnstyledButton>
      <span className={classes.end}>
        <PriorityIcon priority={task.priority} />
        {task.dueDate && <DueChip dueDate={task.dueDate} status={task.status} />}
        {assignees.length > 0 && (
          <span className={classes.avatars}>
            {assignees.slice(0, 2).map((m) => (
              <UserAvatar key={m.userId} src={m.avatarUrl} name={m.name || m.email} size={22} radius="xl" />
            ))}
          </span>
        )}
      </span>
    </div>
  );
}
