import { celebrate } from "@/shared/lib/confetti";
import { groupTasks, topOf } from "../lib/board";
import { earnsCelebration } from "../lib/celebrate";
import type { Bucket, Task, TaskPatch } from "../types";

const NO_TASKS: Task[] = [];

type Actions = {
  create: (task: TaskPatch & { title: string }) => Promise<boolean>;
  update: (id: string, patch: TaskPatch) => Promise<boolean>;
};

export function useTaskWorkflow(tasks: Task[], buckets: Bucket[], actions: Actions) {
  const topOfStatus = (status: Task["status"]) => topOf(groupTasks(tasks, "progress", buckets).get(status) ?? NO_TASKS);

  const withOrder = (task: Task, patch: TaskPatch): TaskPatch =>
    patch.status && patch.status !== task.status && patch.order === undefined
      ? { ...patch, order: topOfStatus(patch.status) }
      : patch;

  const update = async (task: Task, patch: TaskPatch): Promise<boolean> => {
    const earned = patch.status === "done" && earnsCelebration(task, tasks, buckets);
    const ok = await actions.update(task.id, withOrder(task, patch));
    if (ok && earned) celebrate();
    return ok;
  };

  const toggleDone = (task: Task) => void update(task, { status: task.status === "done" ? "todo" : "done" });

  const create = (patch: TaskPatch & { title: string }) =>
    actions.create({ ...patch, order: topOfStatus(patch.status ?? "todo") });

  const createSubtask = (parent: Task, title: string) =>
    create({ title, parentId: parent.id, status: "todo", ...(parent.bucketId ? { bucketId: parent.bucketId } : {}) });

  return { update, toggleDone, create, createSubtask };
}
