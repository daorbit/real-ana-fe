import { useState } from "react";
import { TemplatePreviewModal } from "@/features/dashboards/components/templates/TemplatePreviewModal";
import { BuildingDialog } from "@/features/dashboards/components/BuildingDialog";
import { useCreateDashboard } from "@/features/dashboards/hooks/useCreateDashboard";
import { TEMPLATE_MAP } from "@/features/dashboards/templates";
import type { DashboardTemplate } from "@/features/dashboards/templates";

export function useTemplateFlow(workspaceId: string | undefined) {
  const [preview, setPreview] = useState<DashboardTemplate | null>(null);
  const { createFromTemplate, creating } = useCreateDashboard(workspaceId);

  const dialogs = (
    <>
      <TemplatePreviewModal
        template={creating ? null : preview}
        onClose={() => setPreview(null)}
        onCreate={(t, name, range) => {
          setPreview(null);
          void createFromTemplate(t.id, name, range);
        }}
      />
      <BuildingDialog
        template={creating ? TEMPLATE_MAP[creating.templateId] : null}
        name={creating?.name ?? ""}
      />
    </>
  );

  return { openTemplate: setPreview, dialogs };
}
