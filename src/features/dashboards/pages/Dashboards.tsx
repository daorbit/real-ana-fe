import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@mantine/core";
import { Plus, FolderKanban, LayoutGrid } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useGetDashboardsQuery, useGetEmbedsQuery } from "@/features/dashboards/api";
import { ViewSwitch } from "@/features/dashboards/components/home/ViewSwitch";
import { DashboardLibrary } from "@/features/dashboards/components/home/DashboardLibrary";
import { StartPanel } from "@/features/dashboards/components/home/StartPanel";
import { DashboardListSkeleton, DashboardWelcomeSkeleton } from "@/features/dashboards/components/DashboardsSkeletons";
import { useHasDashboardsHint } from "@/features/dashboards/hooks/useHasDashboardsHint";
import { EmbedsPanel } from "@/features/dashboards/components/embeds/EmbedsPanel";
import { EmbedModal } from "@/features/dashboards/components/embeds/EmbedModal";
import type { DashboardsView } from "@/features/dashboards/components/home/ViewSwitch";

type EmbedTarget = { id: string | null } | null;

export default function Dashboards() {
  useTitle("Dashboards");
  const [params, setParams] = useSearchParams();
  const tab: DashboardsView = params.get("tab") === "embeds" ? "embeds" : "dashboards";
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id;

  const { data: dashboards = [], isLoading: dashboardsLoading } = useGetDashboardsQuery(workspaceId ?? "", { skip: !workspaceId });
  const { data: embeds = [], isLoading: embedsLoading } = useGetEmbedsQuery(workspaceId ?? "", { skip: !workspaceId });
  const isLoading = dashboardsLoading || embedsLoading;
  const expectsList = useHasDashboardsHint(workspaceId, !isLoading, dashboards.length + embeds.length > 0);
  const [embedTarget, setEmbedTarget] = useState<EmbedTarget>(null);

  if (!active) {
    return (
      <AppShell>
        <EmptyState
          icon={FolderKanban}
          title="No workspace yet"
          description="Dashboards live inside a workspace. Create one first."
          action={{ label: "Create a workspace", to: "/app/workspaces", icon: Plus }}
        />
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        {expectsList || tab === "embeds" ? <DashboardListSkeleton /> : <DashboardWelcomeSkeleton />}
      </AppShell>
    );
  }

  const newEmbed = () => setEmbedTarget({ id: null });
  const switchTo = (view: DashboardsView) => setParams(view === "embeds" ? { tab: "embeds" } : {}, { replace: true });

  let action: ReactNode = null;
  if (canEdit && tab === "dashboards" && dashboards.length > 0) {
    action = (
      <Button component={Link} to="/app/dashboards/new" color="emerald" leftSection={<Plus size={15} />}>
        New dashboard
      </Button>
    );
  } else if (canEdit && tab === "embeds" && embeds.length > 0) {
    action = (
      <Button color="emerald" leftSection={<Plus size={15} />} onClick={newEmbed}>
        New embed
      </Button>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Dashboards"
        description={
          tab === "dashboards"
            ? "Focused views built from any widget, arranged the way you work."
            : "Single live charts and numbers you can put on any website."
        }
        actions={action}
      >
        <ViewSwitch value={tab} dashboards={dashboards.length} embeds={embeds.length} onChange={switchTo} />
      </PageHeader>

      {tab === "dashboards" && dashboards.length > 0 && (
        <DashboardLibrary workspaceId={active._id} dashboards={dashboards} canEdit={canEdit} />
      )}

      {tab === "dashboards" && dashboards.length === 0 && (canEdit ? (
        <StartPanel workspaceId={active._id} onEmbed={newEmbed} />
      ) : (
        <EmptyState
          icon={LayoutGrid}
          title="No dashboards yet"
          description="Ask an editor in this workspace to create one."
          minHeight="44vh"
        />
      ))}

      {tab === "embeds" && (
        <EmbedsPanel
          workspaceId={active._id}
          embeds={embeds}
          canEdit={canEdit}
          onOpen={(e) => setEmbedTarget({ id: e.id })}
          onNew={newEmbed}
        />
      )}

      <EmbedModal
        opened={embedTarget !== null}
        workspaceId={active._id}
        embedId={embedTarget?.id ?? null}
        initialWidget={null}
        onClose={() => setEmbedTarget(null)}
      />
    </AppShell>
  );
}
