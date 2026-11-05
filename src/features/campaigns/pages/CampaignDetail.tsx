import { useState } from "react";
import { Button, Group, Modal, Skeleton, Stack, Text } from "@mantine/core";
import { ArrowLeft, Pause, Play, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { ErrorState } from "@/shared/ui/ErrorState";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { notify, notifyError } from "@/shared/lib/notify";
import { useTitle } from "@/shared/lib/useTitle";
import { useDemo } from "@/features/demo/context";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useDeleteCampaignMutation, usePauseCampaignMutation, useResumeCampaignMutation } from "@/features/campaigns/api";
import { CampaignStatusBadge } from "@/features/campaigns/components/CampaignStatusBadge";
import { CampaignFailures } from "@/features/campaigns/components/detail/CampaignFailures";
import { CampaignSummary } from "@/features/campaigns/components/detail/CampaignSummary";
import { useCampaignDetail } from "@/features/campaigns/hooks/useCampaignDetail";
import classes from "@/features/campaigns/components/Campaigns.module.css";
import studio from "@/features/popups/components/studio/PopupStudio.module.css";

export default function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { demo } = useDemo();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { campaigns: appOn } = useWorkspaceApps();
  const workspaceId = appOn ? active?._id : undefined;
  const { campaign, loading, notFound } = useCampaignDetail(workspaceId, campaignId);
  const [pause, pauseState] = usePauseCampaignMutation();
  const [resume, resumeState] = useResumeCampaignMutation();
  const [remove, removeState] = useDeleteCampaignMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const writable = canEdit && !demo && Boolean(workspaceId && campaignId);
  useTitle(campaign?.name ?? "Campaign");

  const run = async (action: () => Promise<unknown>, failure: string) => {
    try {
      await action();
    } catch (e) {
      notifyError(e, failure);
    }
  };

  const onDelete = () =>
    run(async () => {
      await remove({ workspaceId: workspaceId!, id: campaignId! }).unwrap();
      notify.info("Campaign deleted.");
      navigate("/app/campaigns");
    }, "Could not delete the campaign.");

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
                <Button variant="subtle" color="red" leftSection={<Trash2 size={15} />} onClick={() => setConfirmDelete(true)}>
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
        <Skeleton height={160} radius="lg" />
      ) : notFound || !campaign ? (
        <ErrorState title="Campaign not found" description="It may have been deleted. Go back to Campaigns to see the rest." />
      ) : (
        <>
          <CampaignSummary campaign={campaign} />
          {busy && <p className={classes.note}>Emails go out in batches every few minutes. This page updates on its own.</p>}
          {status === "paused" && campaign.lastError && <p className={classes.note}>Paused: {campaign.lastError}</p>}
          {workspaceId && campaignId && !demo && campaign.counts.failed > 0 && <CampaignFailures workspaceId={workspaceId} id={campaignId} />}
        </>
      )}

      <Modal opened={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this campaign?" centered>
        <Stack gap="md">
          <Text size="sm">Its report is deleted too. Emails already sent can't be recalled.</Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button color="red" loading={removeState.isLoading} onClick={() => void onDelete()}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
}
