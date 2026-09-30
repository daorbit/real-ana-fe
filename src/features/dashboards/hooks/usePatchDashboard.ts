import { useCallback } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store";
import { dashboardsApi, useUpdateDashboardMutation } from "@/features/dashboards/api";
import type { DashboardInput } from "@/features/dashboards/types";

export function usePatchDashboard(workspaceId: string | undefined, id: string | undefined) {
  const dispatch = useDispatch<AppDispatch>();
  const [update, { isLoading }] = useUpdateDashboardMutation();

  const patch = useCallback(
    async (input: DashboardInput) => {
      if (!workspaceId || !id) return null;
      const next = await update({ workspaceId, id, ...input }).unwrap();
      await dispatch(dashboardsApi.util.upsertQueryData("getDashboard", { workspaceId, id }, next));
      return next;
    },
    [workspaceId, id, update, dispatch]
  );

  return { patch, patching: isLoading };
}
