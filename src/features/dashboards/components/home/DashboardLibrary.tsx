import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FeaturedDashboard } from "@/features/dashboards/components/home/FeaturedDashboard";
import { DashboardGrid } from "@/features/dashboards/components/home/DashboardGrid";
import { LibraryToolbar } from "@/features/dashboards/components/home/LibraryToolbar";
import { QuickStart } from "@/features/dashboards/components/home/QuickStart";
import { useDashboardActions } from "@/features/dashboards/hooks/useDashboardActions";
import { useDashboardList } from "@/features/dashboards/hooks/useDashboardList";
import { useTemplateFlow } from "@/features/dashboards/hooks/useTemplateFlow";
import type { Dashboard } from "@/features/dashboards/types";
import classes from "@/features/dashboards/components/home/Home.module.css";

const CONTROLS_FROM = 5;

export function DashboardLibrary({
  workspaceId,
  dashboards,
  canEdit,
}: {
  workspaceId: string;
  dashboards: Dashboard[];
  canEdit: boolean;
}) {
  const navigate = useNavigate();
  const { duplicateDashboard, deleteDashboard, busy } = useDashboardActions(workspaceId);
  const { openTemplate, dialogs } = useTemplateFlow(workspaceId);
  const list = useDashboardList(dashboards);
  const { featured } = list;
  const open = (d: Dashboard) => navigate(`/app/dashboards/${d.id}`);

  return (
    <div className={classes.library}>
      {featured && (
        <FeaturedDashboard
          dashboard={featured}
          canEdit={canEdit}
          busy={busy[featured.id] ?? null}
          onOpen={() => open(featured)}
          onDuplicate={() => duplicateDashboard(featured)}
          onDelete={() => deleteDashboard(featured)}
        />
      )}

      {(list.items.length > 0 || list.searching || canEdit) && (
        <section>
          <LibraryToolbar
            title={list.searching ? "Results" : featured ? "More dashboards" : "All dashboards"}
            count={list.items.length}
            showControls={dashboards.length >= CONTROLS_FROM}
            query={list.query}
            sort={list.sort}
            onQuery={list.setQuery}
            onSort={list.setSort}
          />
          {list.searching && list.items.length === 0 ? (
            <EmptyState compact icon={Search} title="No dashboards match" description="Try a different name." />
          ) : (
            <DashboardGrid
              dashboards={list.items}
              canEdit={canEdit}
              showNew={canEdit && !list.searching}
              busy={busy}
              onOpen={open}
              onDuplicate={duplicateDashboard}
              onDelete={deleteDashboard}
            />
          )}
        </section>
      )}

      {canEdit && <QuickStart onOpen={openTemplate} />}
      {dialogs}
    </div>
  );
}
