import { useState } from "react";
import { notify, notifyError } from "@/shared/lib/notify";
import { useCreateTaskMutation } from "@/features/tasks/api";
import { useDemo } from "@/features/demo/context";
import { usePermissions } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";

export function useSearchTask(workspaceId: string) {
  const [createTask] = useCreateTaskMutation();
  const { demo } = useDemo();
  const { canEdit } = usePermissions();
  const { tasks } = useWorkspaceApps();
  const [busy, setBusy] = useState(false);

  const toTask = async (task: { title: string; notes: string; link: string }) => {
    if (demo) return notify.error("Turn off demo data to make changes.");
    setBusy(true);
    try {
      await createTask({
        workspaceId,
        task: { ...task, priority: "medium", labels: [{ text: "Search", color: "blue" }] },
      }).unwrap();
      notify.success("Added to Tasks");
    } catch (e) {
      notifyError(e, "Could not create the task");
    } finally {
      setBusy(false);
    }
  };

  return { enabled: tasks && canEdit, busy, toTask };
}
