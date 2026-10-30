import { dayDiff } from "./dates";
import type { Task } from "../types";

export type MyWorkGroupKey = "overdue" | "today" | "week" | "later" | "none";

export const MY_WORK_GROUPS: { key: MyWorkGroupKey; title: string; empty?: string }[] = [
  { key: "overdue", title: "Overdue" },
  { key: "today", title: "Today", empty: "Nothing due today. Enjoy the calm." },
  { key: "week", title: "Next 7 days" },
  { key: "later", title: "Later" },
  { key: "none", title: "No due date" },
];

function groupOf(task: Task, today: Date): MyWorkGroupKey {
  if (!task.dueDate) return "none";
  const days = dayDiff(today, new Date(task.dueDate));
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 7) return "week";
  return "later";
}

export function myWork(tasks: Task[], userId: string | null): Map<MyWorkGroupKey, Task[]> {
  const today = new Date();
  const groups = new Map<MyWorkGroupKey, Task[]>(MY_WORK_GROUPS.map((g) => [g.key, []]));
  if (!userId) return groups;
  for (const task of tasks) {
    if (task.status === "done" || !task.assigneeIds.includes(userId)) continue;
    groups.get(groupOf(task, today))!.push(task);
  }
  for (const list of groups.values())
    list.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "") || a.order - b.order);
  return groups;
}
