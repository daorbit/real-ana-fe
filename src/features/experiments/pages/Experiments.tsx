import { useMemo } from "react";
import { Button } from "@mantine/core";
import { PanelSkeleton } from "@/shared/ui/Skeletons";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useSites } from "@/features/workspace";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useExperiments } from "@/features/experiments/hooks/useExperiments";
import { ExperimentRow } from "@/features/experiments/components/ExperimentRow";
import { ExperimentsEmpty } from "@/features/experiments/components/ExperimentsEmpty";
import { OptInSnippet } from "@/features/experiments/components/OptInSnippet";
import classes from "@/features/experiments/components/Experiments.module.css";

export default function Experiments() {
  useTitle("A/B tests");
  const navigate = useNavigate();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { experiments: appOn } = useWorkspaceApps();
  const workspaceId = active?._id;
  const list = useExperiments(appOn ? workspaceId : undefined);
  const { sites } = useSites(workspaceId);
  const siteNames = useMemo(() => new Map(sites.map((s) => [s.siteId, s.name])), [sites]);
  const openNew = () => navigate("/app/experiments/new");
  const hasTests = list.experiments.length > 0;

  return (
    <AppShell>
      <PageHeader
        title="A/B tests"
        description="Try a new headline, button or page against the original, and keep the one that converts."
        docsPath={DOCS_SLUGS.quantalogExperiments}
        actions={
          appOn && hasTests && canEdit ? (
            <Button leftSection={<Plus size={15} />} onClick={openNew}>
              New A/B test
            </Button>
          ) : undefined
        }
      />

      {!appOn ? (
        <QuantalogAppGate app="experiments" />
      ) : list.loading ? (
        <PanelSkeleton height={280} />
      ) : list.failed ? (
        <ErrorState onRetry={() => void list.refetch()} />
      ) : !hasTests ? (
        <ExperimentsEmpty canEdit={canEdit} hasSites={sites.length > 0} onCreate={openNew} />
      ) : (
        <>
          <div className={classes.sectionHead}>
            <h3 className={classes.sectionTitle}>Your tests</h3>
            <span className={classes.sectionMeta}>
              {list.running} of {list.limit} running{list.plan ? ` on the ${list.plan} plan` : ""}
            </span>
          </div>
          <div className={classes.list}>
            {list.experiments.map((experiment) => (
              <ExperimentRow key={experiment.id} experiment={experiment} siteName={siteNames.get(experiment.siteId) ?? "Removed site"} />
            ))}
          </div>
          <div className={classes.setup}>
            <OptInSnippet siteId={sites[0]?.siteId ?? ""} />
          </div>
        </>
      )}
    </AppShell>
  );
}
