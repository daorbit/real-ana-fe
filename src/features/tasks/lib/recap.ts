import { addDays, dayDiff, startOfDay, toDateField } from "./dates";
import type { Task } from "../types";

const WEEK = 7;

export type Recap = {
  shipped: number;
  previous: number;
  streak: number;
  top: { userId: string; count: number } | null;
};

function completedBy(tasks: Task[], userId: string | null): Task[] {
  return tasks.filter((t) => t.status === "done" && t.completedAt && (!userId || t.assigneeIds.includes(userId)));
}

function streakOf(done: Task[], today: Date): number {
  const days = new Set(done.map((t) => toDateField(t.completedAt)));
  let cursor = days.has(toDateField(today.toISOString())) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(toDateField(cursor.toISOString()))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function weeklyRecap(tasks: Task[], userId: string | null = null): Recap {
  const today = startOfDay(new Date());
  const done = completedBy(tasks, userId);
  const age = (t: Task) => dayDiff(new Date(t.completedAt!), today);
  const thisWeek = done.filter((t) => age(t) < WEEK);
  const counts = new Map<string, number>();
  for (const task of thisWeek) for (const id of task.assigneeIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    shipped: thisWeek.length,
    previous: done.filter((t) => age(t) >= WEEK && age(t) < WEEK * 2).length,
    streak: streakOf(done, today),
    top: best ? { userId: best[0], count: best[1] } : null,
  };
}
