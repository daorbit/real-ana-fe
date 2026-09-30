import { Link } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { GalleryIntro } from "@/features/dashboards/components/GalleryIntro";
import { TemplateBrowser } from "@/features/dashboards/components/TemplateBrowser";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export default function DashboardTemplates() {
  useTitle("New dashboard");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();

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
        <div className={classes.gallery}>
          <GalleryIntro
            title="Start with a template"
            text="Each one is a considered starting layout for a specific job. Preview it, name it, and make it yours."
          />
          <TemplateBrowser workspaceId={active._id} />
        </div>
      )}
    </AppShell>
  );
}
