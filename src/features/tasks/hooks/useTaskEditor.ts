import { useEffect, useState } from "react";
import { fromDateField, toDateField } from "../lib/dates";
import type { CheckItem, Task, TaskLabel, TaskPatch, TaskPriority, TaskStatus } from "../types";

export type TaskForm = {
  title: string;
  notes: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];
  start: string;
  due: string;
  parentId: string | null;
  blockedBy: string[];
  link: string;
  labels: TaskLabel[];
  checklist: CheckItem[];
  checklistOnCard: boolean;
  bucketId: string | null;
};

const BLANK: TaskForm = {
  title: "",
  notes: "",
  status: "todo",
  priority: "medium",
  assigneeIds: [],
  start: "",
  due: "",
  parentId: null,
  blockedBy: [],
  link: "",
  labels: [],
  checklist: [],
  checklistOnCard: false,
  bucketId: null,
};

function formOf(task: Task | null, defaults: Partial<TaskForm>): TaskForm {
  if (!task) return { ...BLANK, ...defaults };
  return {
    title: task.title,
    notes: task.notes,
    status: task.status,
    priority: task.priority,
    assigneeIds: task.assigneeIds,
    start: toDateField(task.startDate),
    due: toDateField(task.dueDate),
    parentId: task.parentId,
    blockedBy: task.blockedBy,
    link: task.link,
    labels: task.labels,
    checklist: task.checklist,
    checklistOnCard: task.checklistOnCard,
    bucketId: task.bucketId,
  };
}

export function toPatch(form: Partial<TaskForm>): TaskPatch {
  const { due, start, bucketId, ...rest } = form;
  const patch: TaskPatch = bucketId ? { ...rest, bucketId } : rest;
  if (start !== undefined) patch.startDate = fromDateField(start);
  if (due !== undefined) patch.dueDate = fromDateField(due);
  return patch;
}

type TextKey = "title" | "notes" | "link";

export function useTaskEditor(
  task: Task | null,
  opened: boolean,
  defaults: Partial<TaskForm>,
  onUpdate: (patch: TaskPatch) => void,
) {
  const [form, setForm] = useState<TaskForm>(() => formOf(task, defaults));

  useEffect(() => {
    if (opened) setForm(formOf(task, defaults));
  }, [opened, task?.id]);

  useEffect(() => {
    if (task) setForm((f) => ({ ...f, blockedBy: task.blockedBy, parentId: task.parentId, status: task.status }));
  }, [task?.blockedBy, task?.parentId, task?.status]);

  const change = (patch: Partial<TaskForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    if (task) onUpdate(toPatch(patch));
  };

  const type = (key: TextKey, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const commit = (key: TextKey) => {
    if (!task) return;
    const value = form[key].trim();
    if (key === "title" && !value) {
      setForm((f) => ({ ...f, title: task.title }));
      return;
    }
    if (value !== task[key]) onUpdate({ [key]: value });
  };

  return { form, change, type, commit };
}
