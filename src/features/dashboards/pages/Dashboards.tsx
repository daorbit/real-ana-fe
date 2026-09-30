import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Tabs, UnstyledButton } from "@mantine/core";
import { Plus, FolderKanban, Code2 } from "lucide-react";
import { ActivityBellIcon } from "@/features/activity/ActivityBell";
import { AnimatePresence } from "framer-motion";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useGetDashboardsQuery, useGetEmbedsQuery } from "@/features/dashboards/api";
import { useDashboardActions } from "@/features/dashboards/hooks/useDashboardActions";
import { DashboardCard } from "@/features/dashboards/components/DashboardCard";
import { DashboardsWelcome } from "@/features/dashboards/components/DashboardsWelcome";
import { DashboardListSkeleton, DashboardWelcomeSkeleton } from "@/features/dashboards/components/DashboardsSkeletons";
import { useHasDashboardsHint } from "@/features/dashboards/hooks/useHasDashboardsHint";
import { EmbedsPanel } from "@/features/dashboards/components/EmbedsPanel";
import { EmbedModal } from "@/features/dashboards/components/EmbedModal";
import classes from "@/features/dashboards/components/Dashboards.module.css";

type EmbedTarget = { id: string | null } | null;

export default function Dashboards() {
  useTitle("Dashboards");
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "embeds" ? "embeds" : "dashboards";
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id;

  const { data: dashboards = [], isLoading: dashboardsLoading } = useGetDashboardsQuery(workspaceId ?? "", { skip: !workspaceId });
  const { data: embeds = [], isLoading: embedsLoading } = useGetEmbedsQuery(workspaceId ?? "", { skip: !workspaceId });
  const isLoading = dashboardsLoading || embedsLoading;
  const expectsList = useHasDashboardsHint(workspaceId, !isLoading, dashboards.length + embeds.length > 0);
  const { duplicateDashboard, deleteDashboard, busy } = useDashboardActions(workspaceId);
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

  const firstRun = tab === "dashboards" && dashboards.length === 0 && embeds.length === 0;

  if (firstRun) {
    return (
      <AppShell>
        <div className={classes.firstRunBar}>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<Code2 size={15} />}
            onClick={() => setParams({ tab: "embeds" }, { replace: true })}
          >
            Embed a single widget
          </Button>
          <ActivityBellIcon />
        </div>
        <DashboardsWelcome workspaceId={active._id} canEdit={canEdit} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Dashboards"
        description="Focused views built from any widget, and single charts you can embed anywhere."
        actions={
          canEdit && tab === "dashboards" && dashboards.length > 0 ? (
            <Button component={Link} to="/app/dashboards/new" color="emerald" leftSection={<Plus size={15} />}>
              New dashboard
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={tab}
        onChange={(v) => setParams(v === "embeds" ? { tab: "embeds" } : {}, { replace: true })}
        classNames={{ list: classes.tabList, tab: classes.tab }}
      >
        <Tabs.List>
          <Tabs.Tab value="dashboards">
            Dashboards<span className={classes.tabCount}>{dashboards.length}</span>
          </Tabs.Tab>
          <Tabs.Tab value="embeds">
            Embedded widgets<span className={classes.tabCount}>{embeds.length}</span>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {tab === "dashboards" &&
        (dashboards.length === 0 ? (
          <DashboardsWelcome workspaceId={active._id} canEdit={canEdit} />
        ) : (
          <div className={classes.grid}>
            <AnimatePresence>
              {dashboards.map((d, i) => (
                <DashboardCard
                  key={d.id}
                  dashboard={d}
                  index={i}
                  canEdit={canEdit}
                  busy={busy[d.id] ?? null}
                  onOpen={() => navigate(`/app/dashboards/${d.id}`)}
                  onDuplicate={() => duplicateDashboard(d)}
                  onDelete={() => deleteDashboard(d)}
                />
              ))}
            </AnimatePresence>
            {canEdit && (
              <UnstyledButton component={Link} to="/app/dashboards/new" className={classes.newCard}>
                <span className={classes.newIcon}><Plus size={20} /></span>
                New dashboard
                <span className={classes.newHint}>Browse templates or start blank</span>
              </UnstyledButton>
            )}
          </div>
        ))}

      {tab === "embeds" && (
        <EmbedsPanel
          workspaceId={active._id}
          canEdit={canEdit}
          onOpen={(e) => setEmbedTarget({ id: e.id })}
          onNew={() => setEmbedTarget({ id: null })}
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
