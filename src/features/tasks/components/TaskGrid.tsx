import { Table } from "@mantine/core";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { WorkspaceMember } from "@/shared/types";
import { bucketKeyOf, PRIORITY_LABEL, PRIORITY_ORDER, STATUS_ORDER, taskKey } from "../lib/board";
import type { Bucket, Task } from "../types";
import { DueChip, LabelPill, PriorityIcon, ProgressButton, StatusText } from "./TaskBits";
import classes from "./Tasks.module.css";

function sortForGrid(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
      PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority) ||
      a.order - b.order,
  );
}

export function TaskGrid({
  tasks,
  buckets,
  members,
  canEdit,
  onOpen,
  onToggleDone,
}: {
  tasks: Task[];
  buckets: Bucket[];
  members: Map<string, WorkspaceMember>;
  canEdit: boolean;
  onOpen: (task: Task) => void;
  onToggleDone: (task: Task) => void;
}) {
  return (
    <div className={classes.tableWrap}>
      <Table className={classes.table} verticalSpacing={10} horizontalSpacing="md" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Task name</Table.Th>
            <Table.Th>Bucket</Table.Th>
            <Table.Th>Assigned to</Table.Th>
            <Table.Th>Progress</Table.Th>
            <Table.Th>Priority</Table.Th>
            <Table.Th>Due date</Table.Th>
            <Table.Th>Labels</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortForGrid(tasks).map((task) => {
            const assignee = task.assigneeId ? members.get(task.assigneeId) : undefined;
            return (
              <Table.Tr key={task.id} className={classes.row} onClick={() => onOpen(task)}>
                <Table.Td>
                  <span className={classes.rowTitle}>
                    <span onClick={(e) => e.stopPropagation()}>
                      <ProgressButton status={task.status} disabled={!canEdit} onToggle={() => onToggleDone(task)} />
                    </span>
                    <span className={classes.key}>{taskKey(task.key)}</span>
                    {task.title}
                  </span>
                </Table.Td>
                <Table.Td>
                  <span className={classes.usage}>{buckets.find((b) => b.id === bucketKeyOf(task, buckets))?.name ?? ""}</span>
                </Table.Td>
                <Table.Td>
                  {assignee ? (
                    <span className={classes.personCell}>
                      <UserAvatar src={assignee.avatarUrl} name={assignee.name || assignee.email} size={22} radius="xl" />
                      {assignee.name || assignee.email}
                    </span>
                  ) : (
                    <span className={classes.usage}>Unassigned</span>
                  )}
                </Table.Td>
                <Table.Td>
                  <StatusText status={task.status} />
                </Table.Td>
                <Table.Td>
                  <span className={classes.personCell}>
                    <PriorityIcon priority={task.priority} />
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                </Table.Td>
                <Table.Td>{task.dueDate ? <DueChip dueDate={task.dueDate} status={task.status} /> : null}</Table.Td>
                <Table.Td>
                  <span className={classes.rowLabels}>
                    {task.labels.map((l) => (
                      <LabelPill key={l.text} label={l} />
                    ))}
                  </span>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}
