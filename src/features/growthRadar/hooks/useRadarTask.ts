import { useState } from "react";
import { notify, notifyError } from "@/shared/lib/notify";
import { useCreateTaskMutation } from "@/features/tasks/api";
import type { OpportunityDetail } from "../types";

export function useRadarTask(workspaceId: string, demo: boolean) {
  const [createTask] = useCreateTaskMutation();
  const [busy, setBusy] = useState(false);

  const toTask = async (opportunity: OpportunityDetail) => {
    if (demo) return notify.error("Turn off demo data to make changes.");
    setBusy(true);
    try {
      await createTask({
        workspaceId,
        task: {
          title: opportunity.title,
          notes: [opportunity.summary, "", ...opportunity.nextSteps.map((step, i) => `${i + 1}. ${step}`)].join("\n"),
          link: `/app/growth-radar/${opportunity.id}`,
          priority: opportunity.priority === "high" ? "high" : "medium",
          labels: [{ text: "Growth Radar", color: "blue" }],
        },
      }).unwrap();
      notify.success("Added to Tasks");
    } catch (e) {
      notifyError(e, "Could not create the task");
    } finally {
      setBusy(false);
    }
  };

  return { toTask, busy };
}
