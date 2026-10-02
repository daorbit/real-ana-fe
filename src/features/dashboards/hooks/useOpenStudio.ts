import { useNavigate } from "react-router-dom";
import { useGetDashboardsQuery } from "@/features/dashboards/api";
import { useFeatureAllowance } from "@/features/billing/hooks/useFeatureAllowance";

export type StudioLocationState = { prompt?: string } | null;

export function useOpenStudio(workspaceId: string | undefined) {
  const navigate = useNavigate();
  const { data: dashboards = [] } = useGetDashboardsQuery(workspaceId ?? "", { skip: !workspaceId });
  const allowance = useFeatureAllowance("dashboards", dashboards.length);

  return (prompt?: string) =>
    allowance.guard(() => {
      const state: StudioLocationState = prompt?.trim() ? { prompt: prompt.trim() } : null;
      navigate("/app/dashboards/studio", { state });
    });
}
