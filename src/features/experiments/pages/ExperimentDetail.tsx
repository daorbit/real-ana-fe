import { useState } from "react";
import { Button, Menu, Skeleton, Text } from "@mantine/core";
import { ArrowLeft, MoreVertical, Pause, Pencil, Play, Square, Trash2 } from "lucide-react";
import { modals } from "@mantine/modals";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { RefreshButton } from "@/shared/ui/Refresh";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useExperimentDetail } from "@/features/experiments/hooks/useExperimentDetail";
import { TYPE_LABEL } from "@/features/experiments/lib/experimentLabels";
import { ExperimentStatusBadge } from "@/features/experiments/components/ExperimentStatusBadge";
import { ResultsSummary } from "@/features/experiments/components/detail/ResultsSummary";
import { ResultsTable } from "@/features/experiments/components/detail/ResultsTable";
import { EndTestModal } from "@/features/experiments/components/detail/EndTestModal";
import { OptInSnippet } from "@/features/experiments/components/OptInSnippet";
import studio from "@/features/popups/components/studio/PopupStudio.module.css";
import classes from "@/features/experiments/components/Experiments.module.css";

export default function ExperimentDetail() {
  const { experimentId } = useParams<{ experimentId: string }>();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { experiments: appOn } = useWorkspaceApps();
  const workspaceId = appOn ? active?._id : undefined;
  const view = useExperimentDetail(workspaceId, experimentId);
  const [ending, setEnding] = useState(false);
  const experiment = view.detail?.experiment;
  const results = view.detail?.results;
  useTitle(experiment?.name ?? "A/B test");

  const status = experiment?.status;
  const editable = status === "draft" || status === "paused";

  const askDelete = () =>
    modals.openConfirmModal({
      title: "Delete this test",
      children: <Text size="sm">The test and its settings are removed. Visitor events stay in your analytics.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => void view.remove(),
    });

  const actions =
    experiment && canEdit ? (
      <>
        <RefreshButton onRefresh={() => void view.refresh()} refreshing={view.refreshing} lastUpdated={view.lastUpdated} />
        {editable && (
          <Button variant="default" component={Link} to={`/app/experiments/${experiment.id}/edit`} leftSection={<Pencil size={15} />}>
            Edit
          </Button>
        )}
        {status === "running" && (
          <Button variant="default" leftSection={<Pause size={15} />} loading={view.busy} onClick={() => void view.pause()}>
            Pause
          </Button>
        )}
        {editable && (
          <Button leftSection={<Play size={15} />} loading={view.busy} onClick={() => void view.start()}>
            {status === "draft" ? "Start test" : "Resume"}
          </Button>
        )}
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <Button variant="default" aria-label="More actions">
              <MoreVertical size={15} />
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {(status === "running" || status === "paused") && (
              <Menu.Item leftSection={<Square size={14} />} onClick={() => setEnding(true)}>
                End test
              </Menu.Item>
            )}
            <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={askDelete}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </>
    ) : undefined;

  return (
    <AppShell>
      <Link to="/app/experiments" className={studio.back}>
        <ArrowLeft size={15} />
        A/B tests
      </Link>
      <PageHeader
        title={experiment?.name ?? "A/B test"}
        description={experiment ? `${TYPE_LABEL[experiment.type]} test` : undefined}
        docsPath={DOCS_SLUGS.quantalogExperiments}
        actions={actions}
      />

      {!appOn ? (
        <QuantalogAppGate app="experiments" />
      ) : view.loading ? (
        <Skeleton height={320} radius="lg" />
      ) : view.failed || !experiment || !results ? (
        <ErrorState title="Test not found" description="It may have been deleted. Go back to A/B tests to see the rest." />
      ) : (
        <>
          <div className={classes.sectionHead}>
            <ExperimentStatusBadge status={experiment.status} />
            <span className={classes.sectionMeta}>
              Goal: {experiment.goal.type === "page" ? `visits ${experiment.goal.value}` : `triggers ${experiment.goal.value}`}
            </span>
          </div>
          <ResultsSummary experiment={experiment} results={results} />
          <ResultsTable results={results} />
          {experiment.status !== "ended" && results.totalSessions === 0 && (
            <div className={classes.setup}>
              <OptInSnippet siteId={experiment.siteId} />
            </div>
          )}
          <EndTestModal
            opened={ending}
            experiment={experiment}
            results={results}
            busy={view.busy}
            onClose={() => setEnding(false)}
            onEnd={(winner, keepWinner) => {
              void view.end(winner, keepWinner).then((ok) => ok && setEnding(false));
            }}
          />
        </>
      )}
    </AppShell>
  );
}
