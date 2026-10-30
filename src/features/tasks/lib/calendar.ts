import { addDays, fromDateField, startOfWeek, toDateField } from "./dates";
import type { Task, TaskPatch } from "../types";

export const CALENDAR_DAYS = 42;
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function firstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function shiftMonth(month: Date, by: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + by, 1);
}

export function monthGrid(month: Date): Date[] {
  const start = startOfWeek(firstOfMonth(month));
  return Array.from({ length: CALENDAR_DAYS }, (_, i) => addDays(start, i));
}

export function monthTitle(month: Date): string {
  return month.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function tasksByDueDay(tasks: Task[]): Map<string, Task[]> {
  const days = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const key = toDateField(task.dueDate);
    days.set(key, [...(days.get(key) ?? []), task]);
  }
  for (const list of days.values()) list.sort((a, b) => Number(a.status === "done") - Number(b.status === "done") || a.order - b.order);
  return days;
}

export function moveToDay(task: Task, dayKey: string): TaskPatch | null {
  if (!task.dueDate || toDateField(task.dueDate) === dayKey) return null;
  const dueDate = fromDateField(dayKey);
  if (!dueDate) return null;
  if (!task.startDate) return { dueDate };
  const shift = new Date(dueDate).getTime() - new Date(task.dueDate).getTime();
  return { dueDate, startDate: new Date(new Date(task.startDate).getTime() + shift).toISOString() };
}
