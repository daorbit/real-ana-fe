import type { WorkspaceMember } from "@/shared/types";
import type { Bucket, DueFilter, GroupBy, Task, TaskPatch, TaskPriority, TaskStatus } from "../types";

export const STATUS_ORDER: TaskStatus[] = ["todo", "doing", "done"];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Not started",
  doing: "In progress",
  done: "Completed",
};

export const PRIORITY_ORDER: TaskPriority[] = ["urgent", "high", "medium", "low", "none"];

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: "Urgent",
  high: "Important",
  medium: "Medium",
  low: "Low",
  none: "No priority",
};

export const GROUP_LABEL: Record<GroupBy, string> = {
  bucket: "Bucket",
  progress: "Progress",
  assignee: "Assigned to",
  priority: "Priority",
};

export const UNASSIGNED = "__none";
export const MULTIPLE_ASSIGNEES = "__multiple";

export const taskKey = (key: number) => `T-${key}`;

export type BoardColumn = {
  key: string;
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  member?: WorkspaceMember;
  bucket?: Bucket;
  patch: TaskPatch;
};

export function matchesSearch(task: Task, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    task.title.toLowerCase().includes(q) ||
    taskKey(task.key).toLowerCase() === q ||
    task.labels.some((l) => l.text.toLowerCase().includes(q))
  );
}

export function filterTasks(
  tasks: Task[],
  query: string,
  people: Set<string>,
  dueFilter: DueFilter,
  myTasksOnly: boolean,
  userId: string | null,
): Task[] {
  return tasks.filter(
    (task) =>
      matchesSearch(task, query) &&
      (!myTasksOnly || Boolean(userId && task.assigneeIds.includes(userId))) &&
      (dueFilter === "all" || dueState(task.dueDate, task.status) === dueFilter) &&
      (!people.size ||
        (task.assigneeIds.length
          ? task.assigneeIds.some((id) => people.has(id))
          : people.has(UNASSIGNED))),
  );
}

export function bucketKeyOf(task: Task, buckets: Bucket[]): string {
  if (task.bucketId && buckets.some((b) => b.id === task.bucketId)) return task.bucketId;
  return buckets[0]?.id ?? "";
}

export function columnKeyOf(task: Task, groupBy: GroupBy, buckets: Bucket[]): string {
  if (groupBy === "bucket") return bucketKeyOf(task, buckets);
  if (groupBy === "assignee")
    return task.assigneeIds.length > 1
      ? MULTIPLE_ASSIGNEES
      : task.assigneeIds[0] ?? UNASSIGNED;
  if (groupBy === "priority") return task.priority;
  return task.status;
}

export function buildColumns(
  tasks: Task[],
  groupBy: GroupBy,
  members: WorkspaceMember[],
  buckets: Bucket[],
): BoardColumn[] {
  if (groupBy === "bucket")
    return buckets.map((bucket) => ({ key: bucket.id, title: bucket.name, bucket, patch: { bucketId: bucket.id } }));
  if (groupBy === "progress")
    return STATUS_ORDER.map((status) => ({ key: status, title: STATUS_LABEL[status], status, patch: { status } }));
  if (groupBy === "priority")
    return PRIORITY_ORDER.map((priority) => ({ key: priority, title: PRIORITY_LABEL[priority], priority, patch: { priority } }));

  const known = new Set(members.map((m) => m.userId));
  const columns: BoardColumn[] = [
    { key: UNASSIGNED, title: "Unassigned", patch: { assigneeIds: [] } },
    ...members.map((m) => ({ key: m.userId, title: m.name || m.email, member: m, patch: { assigneeIds: [m.userId] } })),
  ];
  const orphans = new Set(
    tasks.flatMap((task) => task.assigneeIds).filter((id) => !known.has(id)),
  );
  for (const id of orphans) columns.push({ key: id, title: "Former member", patch: { assigneeIds: [id] } });
  if (tasks.some((task) => task.assigneeIds.length > 1))
    columns.push({ key: MULTIPLE_ASSIGNEES, title: "Multiple assignees", patch: {} });
  return columns;
}

export function groupTasks(tasks: Task[], groupBy: GroupBy, buckets: Bucket[]): Map<string, Task[]> {
  const groups = new Map<string, Task[]>();
  for (const task of tasks) {
    const key = columnKeyOf(task, groupBy, buckets);
    const list = groups.get(key) ?? [];
    list.push(task);
    groups.set(key, list);
  }
  for (const list of groups.values()) list.sort((a, b) => a.order - b.order);
  return groups;
}

export function orderAt(column: Task[], index: number): number {
  const prev = column[index - 1]?.order;
  const next = column[index]?.order;
  if (prev === undefined && next === undefined) return 0;
  if (prev === undefined) return (next as number) - 1;
  if (next === undefined) return prev + 1;
  return (prev + next) / 2;
}

export function topOf(column: Task[]): number {
  return orderAt(column, 0);
}

export type DueState = "overdue" | "today" | "soon" | "later";

export function dueState(dueDate: string | null, status: TaskStatus): DueState | null {
  if (!dueDate || status === "done") return null;
  const due = new Date(dueDate);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const day = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const days = Math.round((day - start.getTime()) / 86_400_000);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 3) return "soon";
  return "later";
}

export function dueLabel(dueDate: string, state: DueState | null): string {
  if (state === "today") return "Today";
  return new Date(dueDate).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
}
