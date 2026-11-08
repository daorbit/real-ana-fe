import { useMemo, useState } from "react";
import { Button, Skeleton } from "@mantine/core";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { AppShell } from "@/app/AppShell";
import { ErrorState } from "@/shared/ui/ErrorState";
import { PageHeader } from "@/shared/ui/Page";
import { PageTabs } from "@/shared/ui/PageTabs";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useTitle } from "@/shared/lib/useTitle";
import { useDemo } from "@/features/demo/context";
import { demoCampaigns } from "@/features/demo/demoCampaigns";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useUndoableRemoval } from "@/shared/hooks";
import { useDeleteCampaignMutation, useGetCampaignsQuery, useGetCampaignSourcesQuery } from "@/features/campaigns/api";
import { CampaignRow } from "@/features/campaigns/components/CampaignRow";
import { SendingStrip } from "@/features/campaigns/components/SendingStrip";
import { TemplatePicker } from "@/features/campaigns/components/TemplatePicker";
import type { Campaign } from "@/features/campaigns/types";
import classes from "@/features/campaigns/components/Campaigns.module.css";

type Filter = "all" | "sending" | "draft" | "sent";

const EMPTY: Campaign[] = [];

function inFilter(campaign: Campaign, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "sending") return ["sending", "preparing", "paused"].includes(campaign.status);
  return campaign.status === filter;
}

export default function Campaigns() {
  useTitle("Campaigns");
  const { demo } = useDemo();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { campaigns: appOn } = useWorkspaceApps();
  const workspaceId = appOn && !demo ? active?._id : undefined;
  const query = useGetCampaignsQuery(workspaceId ?? skipToken);
  const { currentData: sources } = useGetCampaignSourcesQuery(workspaceId && canEdit ? workspaceId : skipToken);
  const sample = useMemo(() => (demo ? demoCampaigns() : null), [demo]);
  const data = sample ?? query.currentData;
  const loaded = data?.campaigns ?? EMPTY;
  const [deleteCampaign] = useDeleteCampaignMutation();
  const removal = useUndoableRemoval();
  const campaigns = useMemo(() => loaded.filter((campaign) => !removal.hidden.has(campaign.id)), [loaded, removal.hidden]);
  const [filter, setFilter] = useState<Filter>("all");
  const canCreate = canEdit && !demo;
  const onDelete = (campaign: Campaign) => {
    if (!workspaceId) return;
    removal.remove({
      ids: [campaign.id],
      message: `Deleted "${campaign.name}"`,
      commit: () => deleteCampaign({ workspaceId, id: campaign.id }).unwrap(),
      errorMessage: "Could not delete the campaign.",
    });
  };
  const hasCampaigns = campaigns.length > 0;
  const visible = useMemo(() => campaigns.filter((campaign) => inFilter(campaign, filter)), [campaigns, filter]);
  const tabs = useMemo(
    () =>
      ([["all", "All"], ["sending", "Sending"], ["draft", "Drafts"], ["sent", "Sent"]] as const).map(([id, label]) => ({
        id,
        label,
        count: campaigns.filter((campaign) => inFilter(campaign, id)).length,
      })),
    [campaigns],
  );

  return (
    <AppShell>
      <PageHeader
        title="Campaigns"
        description="Design one email and send it to the people who answered your forms."
        docsPath={DOCS_SLUGS.quantalogCampaigns}
        actions={
          appOn && canCreate && hasCampaigns ? (
            <Button component={Link} to="/app/campaigns/templates" leftSection={<Plus size={15} />}>
              New campaign
            </Button>
          ) : undefined
        }
      />

      {!appOn ? (
        <QuantalogAppGate app="campaigns" />
      ) : !sample && query.isLoading ? (
        <Skeleton height={320} radius="lg" />
      ) : !sample && query.isError && !query.currentData ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (
        <div className={classes.page}>
          {hasCampaigns ? (
            <section aria-label="Your campaigns" className={classes.stack}>
              <PageTabs items={tabs} active={filter} onChange={setFilter} label="Campaign status" idPrefix="campaigns" />
              {visible.length ? (
                <div className={classes.list}>
                  {visible.map((campaign) => (
                    <CampaignRow key={campaign.id} campaign={campaign} onDelete={canCreate ? onDelete : undefined} />
                  ))}
                </div>
              ) : (
                <p className={classes.none}>No campaigns here yet.</p>
              )}
            </section>
          ) : (
            <section aria-labelledby="campaign-start" className={classes.stack}>
              <h2 id="campaign-start" className={classes.startTitle}>Start with a template</h2>
              {canCreate ? (
                <TemplatePicker workspaceId={workspaceId} lastAddress="" />
              ) : (
                <p className={classes.none}>An editor of this workspace can create campaigns.</p>
              )}
            </section>
          )}
          <SendingStrip usage={data?.usage} sources={sources} />
        </div>
      )}
    </AppShell>
  );
}
