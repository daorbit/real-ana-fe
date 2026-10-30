import { useState } from "react";
import { notify, notifyError } from "@/shared/lib/notify";
import { useCreateTaskMutation } from "@/features/tasks/api";
import { insightHref } from "../lib/insight";
import type { Insight } from "../types";

export function useInsightTask(workspaceId: string, demo: boolean) {
  const [createTask] = useCreateTaskMutation();
  const [busyId, setBusyId] = useState<string | null>(null);

  const toTask = async (insight: Insight) => {
    if (demo) return notify.error("Turn off demo data to make changes.");
    setBusyId(insight.id);
    try {
      await createTask({
        workspaceId,
        task: {
          title: insight.title,
          notes: insight.body,
          link: insightHref(insight),
          priority: insight.tone === "bad" ? "high" : "medium",
          labels: [{ text: "Insight", color: insight.tone === "bad" ? "red" : "blue" }],
        },
      }).unwrap();
      notify.success("Added to Tasks");
    } catch (e) {
      notifyError(e, "Could not create the task");
    } finally {
      setBusyId(null);
    }
  };

  return { toTask, busyId };
}
