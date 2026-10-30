import { useEffect, useState } from "react";
import { fromDateField, toDateField } from "../lib/dates";
import type { CheckItem, Task, TaskLabel, TaskPatch, TaskPriority, TaskStatus } from "../types";

export type TaskForm = {
  title: string;
  notes: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  due: string;
  link: string;
  labels: TaskLabel[];
  checklist: CheckItem[];
  checklistOnCard: boolean;
};

const BLANK: TaskForm = {
  title: "",
  notes: "",
  status: "todo",
  priority: "medium",
  assigneeId: null,
  due: "",
  link: "",
  labels: [],
  checklist: [],
  checklistOnCard: false,
};

function formOf(task: Task | null, defaults: Partial<TaskForm>): TaskForm {
  if (!task) return { ...BLANK, ...defaults };
  return {
    title: task.title,
    notes: task.notes,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId,
    due: toDateField(task.dueDate),
    link: task.link,
    labels: task.labels,
    checklist: task.checklist,
    checklistOnCard: task.checklistOnCard,
  };
}

export function toPatch(form: Partial<TaskForm>): TaskPatch {
  const { due, ...rest } = form;
  return due === undefined ? rest : { ...rest, dueDate: fromDateField(due) };
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
