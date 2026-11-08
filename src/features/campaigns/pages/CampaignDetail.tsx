import { Button, Skeleton } from "@mantine/core";
import { ArrowLeft, Pause, Play, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { ErrorState } from "@/shared/ui/ErrorState";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { notifyError } from "@/shared/lib/notify";
import { useTitle } from "@/shared/lib/useTitle";
import { useDemo } from "@/features/demo/context";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { usePauseCampaignMutation, useResumeCampaignMutation } from "@/features/campaigns/api";
import { useDeleteCampaign } from "@/features/campaigns/hooks/useDeleteCampaign";
import { CampaignStatusBadge } from "@/features/campaigns/components/CampaignStatusBadge";
import { CampaignFailures } from "@/features/campaigns/components/detail/CampaignFailures";
import { CampaignSummary } from "@/features/campaigns/components/detail/CampaignSummary";
import { CampaignEmailCard } from "@/features/campaigns/components/detail/CampaignEmailCard";
import report from "@/features/campaigns/components/detail/Report.module.css";
import { useCampaignDetail } from "@/features/campaigns/hooks/useCampaignDetail";
import classes from "@/features/campaigns/components/Campaigns.module.css";
import studio from "@/features/popups/components/studio/PopupStudio.module.css";

export default function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { demo } = useDemo();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { campaigns: appOn } = useWorkspaceApps();
  const workspaceId = appOn ? active?._id : undefined;
  const { campaign, loading, notFound } = useCampaignDetail(workspaceId, campaignId);
  const [pause, pauseState] = usePauseCampaignMutation();
  const [resume, resumeState] = useResumeCampaignMutation();
  const askDelete = useDeleteCampaign(workspaceId);
  const writable = canEdit && !demo && Boolean(workspaceId && campaignId);
  useTitle(campaign?.name ?? "Campaign");

  const run = async (action: () => Promise<unknown>, failure: string) => {
    try {
      await action();
    } catch (e) {
      notifyError(e, failure);
    }
  };

  const status = campaign?.status;
  const busy = status === "sending" || status === "preparing";

  return (
    <AppShell>
      <Link to="/app/campaigns" className={studio.back}>
        <ArrowLeft size={15} />
        Campaigns
      </Link>
      <PageHeader
        title={campaign?.name ?? "Campaign"}
        description={campaign?.subject}
        docsPath={DOCS_SLUGS.quantalogCampaigns}
        actions={
          appOn && writable && campaign ? (
            <div className={studio.saveRow}>
              <CampaignStatusBadge status={campaign.status} />
              {status === "draft" && (
                <Button component={Link} to={`/app/campaigns/${campaignId}/edit`}>
                  Edit
                </Button>
              )}
              {status === "sending" && (
                <Button
                  variant="default"
                  leftSection={<Pause size={15} />}
                  loading={pauseState.isLoading}
                  onClick={() => void run(() => pause({ workspaceId: workspaceId!, id: campaignId! }).unwrap(), "Could not pause the campaign.")}
                >
                  Pause
                </Button>
              )}
              {status === "paused" && (
                <Button
                  leftSection={<Play size={15} />}
                  loading={resumeState.isLoading}
                  onClick={() => void run(() => resume({ workspaceId: workspaceId!, id: campaignId! }).unwrap(), "Could not resume the campaign.")}
                >
                  Resume
                </Button>
              )}
              {!busy && (
                <Button variant="subtle" color="red" leftSection={<Trash2 size={15} />} onClick={() => campaignId && askDelete(campaignId)}>
                  Delete
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      {!appOn ? (
        <QuantalogAppGate app="campaigns" />
      ) : loading ? (
        <div className={report.layout}>
          <Skeleton height={260} radius="lg" />
          <Skeleton height={540} radius="lg" />
        </div>
      ) : notFound || !campaign ? (
        <ErrorState title="Campaign not found" description="It may have been deleted. Go back to Campaigns to see the rest." />
      ) : (
        <div className={report.layout}>
          <div className={report.main}>
            <CampaignSummary campaign={campaign} />
            {busy && <p className={classes.note}>Emails go out in batches every few minutes. This page updates on its own.</p>}
            {status === "paused" && campaign.lastError && <p className={classes.note}>Paused: {campaign.lastError}</p>}
            {workspaceId && campaignId && !demo && campaign.counts.failed > 0 && <CampaignFailures workspaceId={workspaceId} id={campaignId} />}
          </div>
          <CampaignEmailCard campaign={campaign} />
        </div>
      )}
    </AppShell>
  );
}
