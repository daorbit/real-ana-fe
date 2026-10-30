import { dueState } from "./board";
import type { Task } from "../types";

export const SERIES = [
  { key: "notStarted", label: "Not started", color: "var(--viz-other)" },
  { key: "inProgress", label: "In progress", color: "var(--viz-1)" },
  { key: "late", label: "Late", color: "var(--viz-2)" },
  { key: "completed", label: "Completed", color: "var(--viz-3)" },
] as const;

export type SeriesKey = (typeof SERIES)[number]["key"];

export type StateCounts = Record<SeriesKey, number>;

export type ChartRow = StateCounts & { name: string; total: number };

const empty = (): StateCounts => ({ notStarted: 0, inProgress: 0, late: 0, completed: 0 });

export function stateOf(task: Task): SeriesKey {
  if (task.status === "done") return "completed";
  if (dueState(task.dueDate, task.status) === "overdue") return "late";
  if (task.status === "doing") return "inProgress";
  return "notStarted";
}

export function countStates(tasks: Task[]): StateCounts {
  const counts = empty();
  for (const task of tasks) counts[stateOf(task)] += 1;
  return counts;
}

export function breakdown(
  tasks: Task[],
  groups: { key: string; name: string }[],
  keyOf: (task: Task) => string,
): ChartRow[] {
  const rows = new Map(groups.map((g) => [g.key, { name: g.name, total: 0, ...empty() }]));
  for (const task of tasks) {
    const row = rows.get(keyOf(task));
    if (!row) continue;
    row[stateOf(task)] += 1;
    row.total += 1;
  }
  return [...rows.values()];
}
