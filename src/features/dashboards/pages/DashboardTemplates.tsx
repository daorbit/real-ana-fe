import { Link } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { TemplateGallery } from "@/features/dashboards/components/templates/TemplateGallery";
import { useTemplateFlow } from "@/features/dashboards/hooks/useTemplateFlow";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export default function DashboardTemplates() {
  useTitle("New dashboard");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { openTemplate, dialogs } = useTemplateFlow(active?._id);

  return (
    <AppShell>
      <Link to="/app/dashboards" className={classes.crumb}>
        <ChevronLeft size={14} /> Dashboards
      </Link>

      {!active || !canEdit ? (
        <EmptyState
          icon={Lock}
          title="Editors only"
          description="Ask an editor or admin in this workspace to create dashboards."
          action={{ label: "Back to dashboards", to: "/app/dashboards" }}
        />
      ) : (
        <>
          <PageHeader
            title="New dashboard"
            description="Start from a layout built for the job, or a blank canvas. Preview anything before you create it."
          />
          <TemplateGallery onOpen={openTemplate} />
          {dialogs}
        </>
      )}
    </AppShell>
  );
}
