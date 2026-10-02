import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateDashboardMutation, useGetDashboardsQuery } from "@/features/dashboards/api";
import { useFeatureAllowance } from "@/features/billing/hooks/useFeatureAllowance";
import { ORBIT_TEMPLATE, TEMPLATE_MAP } from "@/features/dashboards/templates";
import { notifyError } from "@/shared/lib/notify";
import type { DashboardTemplate } from "@/features/dashboards/templates";
import type { DashboardDraft, DashboardRange } from "@/features/dashboards/types";

const MIN_BUILD_MS = 1900;

export function defaultDashboardName(templateId: string): string {
  const template = TEMPLATE_MAP[templateId] ?? TEMPLATE_MAP.blank;
  return template.id === "blank" ? "Untitled dashboard" : `${template.name} dashboard`;
}

type Build = { template: DashboardTemplate; name: string; description: string; range: DashboardRange };

export function useCreateDashboard(workspaceId: string | undefined) {
  const navigate = useNavigate();
  const [create] = useCreateDashboardMutation();
  const [creating, setCreating] = useState<{ template: DashboardTemplate; name: string } | null>(null);
  const { data: dashboards = [] } = useGetDashboardsQuery(workspaceId ?? "", { skip: !workspaceId });
  const allowance = useFeatureAllowance("dashboards", dashboards.length);

  const build = async ({ template, name, description, range }: Build) => {
    if (!workspaceId || creating) return false;
    if (allowance.atLimit) {
      allowance.prompt();
      return false;
    }
    setCreating({ template, name });

    try {
      const [dashboard] = await Promise.all([
        create({ workspaceId, name, description, template: template.id, range, layout: template.layout }).unwrap(),
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

  const createFromTemplate = (templateId: string, name?: string, range?: DashboardRange) => {
    const template = TEMPLATE_MAP[templateId] ?? TEMPLATE_MAP.blank;
    return build({
      template,
      name: name?.trim() || defaultDashboardName(template.id),
      description: template.id === "blank" ? "" : template.description,
      range: range ?? template.range,
    });
  };

  const createFromDraft = (draft: DashboardDraft) =>
    build({
      template: { ...ORBIT_TEMPLATE, layout: draft.layout, range: draft.range },
      name: draft.name.trim() || "Untitled dashboard",
      description: draft.description,
      range: draft.range,
    });

  return { createFromTemplate, createFromDraft, creating, guard: allowance.guard };
}
