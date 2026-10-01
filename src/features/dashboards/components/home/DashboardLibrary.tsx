import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@mantine/hooks";
import { Search } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DashboardGrid } from "@/features/dashboards/components/home/DashboardGrid";
import { DashboardTable } from "@/features/dashboards/components/home/DashboardTable";
import { LibraryToolbar } from "@/features/dashboards/components/home/LibraryToolbar";
import { useDashboardActions } from "@/features/dashboards/hooks/useDashboardActions";
import { useDashboardList } from "@/features/dashboards/hooks/useDashboardList";
import type { LibraryView } from "@/features/dashboards/components/home/LibraryToolbar";
import type { Dashboard } from "@/features/dashboards/types";
import classes from "@/features/dashboards/components/home/Home.module.css";

export function DashboardLibrary({
  workspaceId,
  dashboards,
  canEdit,
  usage,
  onNew,
}: {
  workspaceId: string;
  dashboards: Dashboard[];
  canEdit: boolean;
  usage: string | null;
  onNew: () => void;
}) {
  const navigate = useNavigate();
  const { duplicateDashboard, deleteDashboard, busy } = useDashboardActions(workspaceId);
  const list = useDashboardList(dashboards);
  const [view, setView] = useLocalStorage<LibraryView>({ key: "quantalog:dashboards-view", defaultValue: "grid" });

  const props = {
    dashboards: list.items,
    canEdit,
    busy,
    onOpen: (d: Dashboard) => navigate(`/app/dashboards/${d.id}`),
    onDuplicate: duplicateDashboard,
    onDelete: deleteDashboard,
  };

  return (
    <div className={classes.library}>
      <LibraryToolbar
        count={dashboards.length}
        usage={usage}
        query={list.query}
        sort={list.sort}
        view={view}
        onQuery={list.setQuery}
        onSort={list.setSort}
        onView={setView}
      />
      {list.searching && list.items.length === 0 ? (
        <EmptyState compact icon={Search} title="No dashboards match" description="Try a different name." />
      ) : view === "list" ? (
        <DashboardTable {...props} />
      ) : (
        <DashboardGrid {...props} showNew={canEdit && !list.searching} onNew={onNew} />
      )}
    </div>
  );
}
