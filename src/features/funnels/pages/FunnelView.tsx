import { Button, Skeleton } from "@mantine/core";
import { Pencil, SearchX } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { confirmDelete } from "@/shared/lib/notify";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import type { FunnelStepInput } from "@/shared/types";
import { useFunnelRange, withSearch } from "../hooks/useFunnelRange";
import { useFunnelRun } from "../hooks/useFunnelRun";
import { useFunnelSites } from "../hooks/useFunnelSites";
import { useFunnelMutations } from "../hooks/useFunnelMutations";
import { useSavedFunnel } from "../hooks/useSavedFunnels";
import { BackLink } from "../components/BackLink";
import { FunnelRangeControls } from "../components/FunnelRangeControls";
import { FunnelResults } from "../components/FunnelResults";
import { FunnelStepPath } from "../components/FunnelStepPath";
import { FunnelTrend } from "../components/FunnelTrend";
import { FunnelViewMenu } from "../components/FunnelViewMenu";
import classes from "../components/Funnels.module.css";

const NO_STEPS: FunnelStepInput[] = [];

export default function FunnelView() {
  const { funnelId } = useParams();
  const navigate = useNavigate();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { funnels: on } = useWorkspaceApps();
  const workspaceId = active?._id;
  const { range, setRange, compare, setCompare, search } = useFunnelRange();
  const sites = useFunnelSites(workspaceId);
  const { funnel, loading, missing } = useSavedFunnel(workspaceId, funnelId, on);
  const { report, running } = useFunnelRun(workspaceId, funnel?.steps ?? NO_STEPS, range, sites, compare);
  const { destroy } = useFunnelMutations(workspaceId);
  useTitle(funnel?.name ?? "Funnel");

  const listPath = withSearch("/app/funnels", search);

  const askDelete = () => {
    if (!funnel) return;
    confirmDelete({
      title: "Delete funnel?",
      body: `“${funnel.name}” will be removed for everyone in this workspace. Your tracking data is not affected.`,
      confirmLabel: "Delete funnel",
      onConfirm: async () => {
        if (await destroy(funnel.id)) navigate(listPath, { replace: true });
      },
    });
  };

  const duplicate = () => {
    if (!funnel) return;
    navigate(withSearch("/app/funnels/new", search), { state: { name: `${funnel.name} copy`, steps: funnel.steps } });
  };

  return (
    <AppShell>
      <BackLink to={listPath} label="All funnels" />
      <PageHeader
        title={funnel?.name ?? (loading ? "Loading…" : "Funnel")}
        docsPath={DOCS_SLUGS.funnels}
        actions={
          on && funnel ? (
            <>
              <FunnelRangeControls range={range} onRangeChange={setRange} compare={compare} onCompareChange={setCompare} />
              {canEdit && (
                <>
                  <Button
                    component={Link}
                    to={withSearch(`/app/funnels/${funnel.id}/edit`, search)}
                    variant="default"
                    leftSection={<Pencil size={14} />}
                  >
                    Edit
                  </Button>
                  <FunnelViewMenu onDuplicate={duplicate} onDelete={askDelete} />
                </>
              )}
            </>
          ) : undefined
        }
      >
        {funnel && <FunnelStepPath steps={funnel.steps} />}
      </PageHeader>

      {!active ? null : !on ? (
        <QuantalogAppGate app="funnels" />
      ) : missing ? (
        <EmptyState
          icon={SearchX}
          title="This funnel no longer exists"
          description="It may have been deleted by someone else in your workspace."
          action={{ label: "Back to all funnels", to: listPath }}
        />
      ) : !funnel || !report ? (
        <div className={classes.viewSkeleton}>
          <Skeleton height={96} radius="lg" />
          <Skeleton height={320} radius="lg" />
        </div>
      ) : (
        <div className={classes.viewStack}>
          <section className={classes.card} aria-label="Results">
            <FunnelResults report={report} running={running} />
          </section>
          {report.trend && (report.steps[0]?.count ?? 0) > 0 && (
            <FunnelTrend points={report.trend.points} unit={report.trend.unit} />
          )}
        </div>
      )}
    </AppShell>
  );
}
