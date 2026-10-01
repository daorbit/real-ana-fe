import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateDashboardMutation, useGetDashboardsQuery } from "@/features/dashboards/api";
import { useFeatureAllowance } from "@/features/billing/hooks/useFeatureAllowance";
import { TEMPLATE_MAP } from "@/features/dashboards/templates";
import { notifyError } from "@/shared/lib/notify";
import type { DashboardRange } from "@/features/dashboards/types";

const MIN_BUILD_MS = 1900;

export function defaultDashboardName(templateId: string): string {
  const template = TEMPLATE_MAP[templateId] ?? TEMPLATE_MAP.blank;
  return template.id === "blank" ? "Untitled dashboard" : `${template.name} dashboard`;
}

export function useCreateDashboard(workspaceId: string | undefined) {
  const navigate = useNavigate();
  const [create] = useCreateDashboardMutation();
  const [creating, setCreating] = useState<{ templateId: string; name: string } | null>(null);
  const { data: dashboards = [] } = useGetDashboardsQuery(workspaceId ?? "", { skip: !workspaceId });
  const allowance = useFeatureAllowance("dashboards", dashboards.length);

  const createFromTemplate = async (templateId: string, name?: string, range?: DashboardRange) => {
    if (!workspaceId || creating) return false;
    if (allowance.atLimit) {
      allowance.prompt();
      return false;
    }
    const template = TEMPLATE_MAP[templateId] ?? TEMPLATE_MAP.blank;
    const finalName = name?.trim() || defaultDashboardName(template.id);
    setCreating({ templateId: template.id, name: finalName });

    try {
      const [dashboard] = await Promise.all([
        create({
          workspaceId,
          name: finalName,
          description: template.id === "blank" ? "" : template.description,
          template: template.id,
          range: range ?? template.range,
          layout: template.layout,
        }).unwrap(),
        new Promise((r) => setTimeout(r, MIN_BUILD_MS)),
      ]);
      navigate(`/app/dashboards/${dashboard.id}${template.layout.length ? "" : "?customize=1"}`);
      return true;
    } catch (e) {
      notifyError(e, "Could not create the dashboard.");
      return false;
    } finally {
      setCreating(null);
    }
  };

  return { createFromTemplate, creating };
}
