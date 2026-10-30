import type { LabelColor, Task, TaskLabel } from "../types";

export const LABEL_COLORS: LabelColor[] = ["blue", "green", "amber", "red", "violet", "pink", "teal", "gray"];

export function knownLabels(tasks: Task[]): TaskLabel[] {
  const seen = new Map<string, TaskLabel>();
  for (const task of tasks) {
    for (const label of task.labels) {
      const key = label.text.toLowerCase();
      if (!seen.has(key)) seen.set(key, label);
    }
  }
  return [...seen.values()].sort((a, b) => a.text.localeCompare(b.text));
}

export function newCheckId(): string {
  return Math.random().toString(36).slice(2, 10);
}
