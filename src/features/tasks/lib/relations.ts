import { taskKey } from "./board";
import type { Task } from "../types";

export type TaskIndex = {
  byId: Map<string, Task>;
  children: Map<string, Task[]>;
  blocks: Map<string, Task[]>;
};

const NONE: Task[] = [];

export function indexTasks(tasks: Task[]): TaskIndex {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const children = new Map<string, Task[]>();
  const blocks = new Map<string, Task[]>();
  for (const task of tasks) {
    if (task.parentId) children.set(task.parentId, [...(children.get(task.parentId) ?? []), task]);
    for (const blocker of task.blockedBy) blocks.set(blocker, [...(blocks.get(blocker) ?? []), task]);
  }
  for (const list of children.values()) list.sort((a, b) => a.key - b.key);
  return { byId, children, blocks };
}

export function childrenOf(index: TaskIndex, id: string): Task[] {
  return index.children.get(id) ?? NONE;
}

export function blockedTasksOf(index: TaskIndex, id: string): Task[] {
  return index.blocks.get(id) ?? NONE;
}

export function blockersOf(index: TaskIndex, task: Task): Task[] {
  return task.blockedBy.map((id) => index.byId.get(id)).filter((t): t is Task => Boolean(t));
}

export function openBlockers(index: TaskIndex, task: Task): Task[] {
  return task.status === "done" ? NONE : blockersOf(index, task).filter((t) => t.status !== "done");
}

export function subtaskProgress(index: TaskIndex, id: string): { done: number; total: number } | null {
  const list = childrenOf(index, id);
  return list.length ? { done: list.filter((t) => t.status === "done").length, total: list.length } : null;
}

export function taskOption(task: Task) {
  return { value: task.id, label: `${taskKey(task.key)} ${task.title}` };
}

export function linkCandidates(tasks: Task[], selfId: string | null, exclude: string[]): Task[] {
  const skip = new Set(selfId ? [selfId, ...exclude] : exclude);
  return tasks.filter((t) => !skip.has(t.id) && t.status !== "done");
}

export function parentCandidates(tasks: Task[], task: Task | null, index: TaskIndex): Task[] {
  if (task && childrenOf(index, task.id).length) return NONE;
  return tasks.filter((t) => !t.parentId && t.id !== task?.id && (t.status !== "done" || t.id === task?.parentId));
}
