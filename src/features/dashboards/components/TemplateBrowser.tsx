import { useState } from "react";
import { TemplateGallery } from "@/features/dashboards/components/TemplateGallery";
import { TemplatePreviewModal } from "@/features/dashboards/components/TemplatePreviewModal";
import { BuildingDialog } from "@/features/dashboards/components/BuildingDialog";
import { useCreateDashboard } from "@/features/dashboards/hooks/useCreateDashboard";
import { TEMPLATE_MAP } from "@/features/dashboards/templates";
import type { DashboardTemplate } from "@/features/dashboards/templates";

export function TemplateBrowser({ workspaceId }: { workspaceId: string }) {
  const [preview, setPreview] = useState<DashboardTemplate | null>(null);
  const { createFromTemplate, creating } = useCreateDashboard(workspaceId);

  return (
    <>
      <TemplateGallery onOpen={setPreview} />

      <TemplatePreviewModal
        template={creating ? null : preview}
        onClose={() => setPreview(null)}
        onCreate={(t, name) => {
          setPreview(null);
          void createFromTemplate(t.id, name);
        }}
      />

      <BuildingDialog
        template={creating ? TEMPLATE_MAP[creating.templateId] : null}
        name={creating?.name ?? ""}
      />
    </>
  );
}
