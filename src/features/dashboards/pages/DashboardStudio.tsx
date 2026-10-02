import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LayoutGrid, Lock, SearchX } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { HomeSkeleton } from "@/shared/ui/Skeletons";
import { useTitle } from "@/shared/lib/useTitle";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useGetDashboardQuery } from "@/features/dashboards/api";
import { useDashboardStudio } from "@/features/dashboards/hooks/useDashboardStudio";
import { StudioTopBar } from "@/features/dashboards/components/studio/StudioTopBar";
import { StudioChat } from "@/features/dashboards/components/studio/StudioChat";
import { StudioPreview } from "@/features/dashboards/components/studio/StudioPreview";
import { StudioLanding } from "@/features/dashboards/components/studio/StudioLanding";
import { BuildingDialog } from "@/features/dashboards/components/BuildingDialog";
import type { StudioLocationState } from "@/features/dashboards/hooks/useOpenStudio";
import classes from "@/features/dashboards/components/studio/Studio.module.css";

export default function DashboardStudio() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id;

  const { data: dashboard, isLoading, isError } = useGetDashboardQuery(
    { workspaceId: workspaceId ?? "", id: id ?? "" },
    { skip: !workspaceId || !id }
  );
  const studio = useDashboardStudio(workspaceId, id ? dashboard : undefined);
  const kickedOff = useRef(false);
  useTitle(id ? `Edit ${dashboard?.name ?? "dashboard"} with Orbit` : "Build a dashboard with Orbit");

  useEffect(() => {
    document.body.dataset.page = "dashboard-studio";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  const initial = (location.state as StudioLocationState)?.prompt;
  useEffect(() => {
    if (!initial || !workspaceId || kickedOff.current) return;
    if (id && !dashboard) return;
    kickedOff.current = true;
    studio.orbit.start(initial);
    navigate(location.pathname, { replace: true, state: null });
  }, [initial, workspaceId, id, dashboard, studio.orbit, navigate, location.pathname]);

  if (!active || !canEdit) {
    return (
      <AppShell>
        <EmptyState
          icon={Lock}
          title="Editors only"
          description="Ask an editor or admin in this workspace to build dashboards."
          action={{ label: "Back to dashboards", to: "/app/dashboards" }}
        />
      </AppShell>
    );
  }

  if (id && isLoading) return <AppShell><HomeSkeleton /></AppShell>;

  if (id && (isError || !dashboard)) {
    return (
      <AppShell>
        <EmptyState
          icon={SearchX}
          title="Dashboard not found"
          description="It may have been deleted, or it belongs to a different workspace."
          action={{ label: "All dashboards", to: "/app/dashboards", icon: LayoutGrid }}
        />
      </AppShell>
    );
  }

  const backTo = id ? `/app/dashboards/${id}` : "/app/dashboards";
  const title = id ? dashboard?.name ?? "Dashboard" : "New dashboard";
  const landing = studio.mode === "create" && !studio.orbit.started;

  return (
    <AppShell>
      <div className={classes.studio}>
        <StudioTopBar studio={studio} backTo={backTo} title={title} showActions={!landing} />
        {landing ? (
          <StudioLanding studio={studio} />
        ) : (
          <div className={classes.panes}>
            <StudioChat studio={studio} />
            <StudioPreview studio={studio} workspaceId={active._id} />
          </div>
        )}
      </div>
      <BuildingDialog template={studio.creating?.template ?? null} name={studio.creating?.name ?? ""} />
    </AppShell>
  );
}
