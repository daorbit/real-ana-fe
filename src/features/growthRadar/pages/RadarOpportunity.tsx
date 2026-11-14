import { Button } from "@mantine/core";
import { PanelSkeleton } from "@/shared/ui/Skeletons";
import { ArrowLeft, ListTodo } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useDemo } from "@/features/demo/context";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useTaskMembers } from "@/features/tasks/hooks/useTaskMembers";
import { useRadarOpportunity } from "../hooks/useRadarData";
import { useOpportunityActions } from "../hooks/useOpportunityActions";
import { useRadarTask } from "../hooks/useRadarTask";
import { OpportunityBody } from "../components/detail/OpportunityBody";
import { StatusMenu } from "../components/detail/StatusMenu";
import classes from "../components/Opportunity.module.css";

export default function RadarOpportunity() {
  const { opportunityId = "" } = useParams<{ opportunityId: string }>();
  const { demo } = useDemo();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { growthRadar: on, tasks: tasksOn } = useWorkspaceApps();
  const workspaceId = active?._id ?? "";

  const { detail, loading, notFound } = useRadarOpportunity(workspaceId, opportunityId, on);
  const actions = useOpportunityActions(workspaceId, opportunityId);
  const { members } = useTaskMembers(workspaceId, demo, on && canEdit);
  const task = useRadarTask(workspaceId, demo);
  useTitle(detail?.title ?? "Growth Radar");

  return (
    <AppShell>
      <Link to="/app/growth-radar" className={classes.back}>
        <ArrowLeft size={15} />
        Growth Radar
      </Link>
      <PageHeader
        title={detail?.title ?? "Finding"}
        description={detail?.entity.label}
        docsPath={DOCS_SLUGS.quantalogGrowthRadar}
        actions={
          on && detail && canEdit ? (
            <div className={classes.actions}>
              {tasksOn && (
                <Button variant="default" leftSection={<ListTodo size={15} />} loading={task.busy} onClick={() => void task.toTask(detail)}>
                  Add to Tasks
                </Button>
              )}
              <StatusMenu opportunity={detail} busy={actions.busy} onPatch={actions.patch} />
            </div>
          ) : undefined
        }
      />

      {!active ? null : !on ? (
        <QuantalogAppGate app="growthRadar" />
      ) : loading ? (
        <div className={classes.layout}>
          <PanelSkeleton height={520} />
          <PanelSkeleton height={360} />
        </div>
      ) : notFound || !detail ? (
        <ErrorState title="Finding not found" description="It may belong to another workspace. Go back to Growth Radar to see the rest." />
      ) : (
        <OpportunityBody opportunity={detail} members={members} canEdit={canEdit && !demo} actions={actions} />
      )}
    </AppShell>
  );
}
