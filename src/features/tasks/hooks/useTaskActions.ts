import { notify, notifyError, confirmDelete } from "@/shared/lib/notify";
import { useFeatureAllowance } from "@/features/billing/hooks/useFeatureAllowance";
import { useCreateTaskMutation, useDeleteTaskMutation, useUpdateTaskMutation } from "../api";
import type { Task, TaskPatch } from "../types";

export function useTaskActions(workspaceId: string, tasks: Task[], demo: boolean) {
  const openCount = tasks.filter((t) => t.status !== "done").length;
  const allowance = useFeatureAllowance("tasks", openCount);
  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const blocked = () => notify.error("Turn off demo data to make changes.");

  const create = async (task: TaskPatch & { title: string }): Promise<boolean> => {
    if (demo) {
      blocked();
      return false;
    }
    if (task.status !== "done" && allowance.atLimit) {
      allowance.prompt();
      return false;
    }
    try {
      await createTask({ workspaceId, task }).unwrap();
      return true;
    } catch (e) {
      notifyError(e, "Could not add the task");
      return false;
    }
  };

  const update = async (id: string, patch: TaskPatch): Promise<boolean> => {
    if (demo) {
      blocked();
      return false;
    }
    try {
      await updateTask({ workspaceId, id, patch }).unwrap();
      return true;
    } catch (e) {
      notifyError(e, "Could not update the task");
      return false;
    }
  };

  const remove = (task: Task, onDone?: () => void) => {
    if (demo) return blocked();
    confirmDelete({
      title: "Delete this task?",
      body: `“${task.title}” will be removed for everyone in the workspace.`,
      confirmLabel: "Delete task",
      onConfirm: async () => {
        try {
          await deleteTask({ workspaceId, id: task.id }).unwrap();
          onDone?.();
          notify.success("Task deleted");
        } catch (e) {
          notifyError(e, "Could not delete the task");
        }
      },
    });
  };

  return { create, creating, update, remove, usage: allowance.usage };
}
