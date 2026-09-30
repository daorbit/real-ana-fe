import { useCallback } from "react";
import { useUpdateDashboardMutation } from "@/features/dashboards/api";
import type { DashboardInput } from "@/features/dashboards/types";

export function usePatchDashboard(workspaceId: string | undefined, id: string | undefined) {
  const [update, { isLoading }] = useUpdateDashboardMutation();

  const patch = useCallback(
    async (input: DashboardInput) => {
      if (!workspaceId || !id) return null;
      return update({ workspaceId, id, ...input }).unwrap();
    },
    [workspaceId, id, update]
  );

  return { patch, patching: isLoading };
}
