import { useMemo } from "react";
import { Button, Skeleton } from "@mantine/core";
import { Mail, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { AppShell } from "@/app/AppShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useTitle } from "@/shared/lib/useTitle";
import { useDemo } from "@/features/demo/context";
import { demoCampaigns } from "@/features/demo/demoCampaigns";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useGetCampaignsQuery } from "@/features/campaigns/api";
import { CampaignRow } from "@/features/campaigns/components/CampaignRow";
import classes from "@/features/campaigns/components/Campaigns.module.css";

export default function Campaigns() {
  useTitle("Campaigns");
  const navigate = useNavigate();
  const { demo } = useDemo();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { campaigns: appOn } = useWorkspaceApps();
  const query = useGetCampaignsQuery(appOn && active?._id && !demo ? active._id : skipToken);
  const sample = useMemo(() => (demo ? demoCampaigns() : null), [demo]);
  const data = sample ?? query.currentData;
  const campaigns = data?.campaigns ?? [];
  const canCreate = canEdit && !demo;
  const openNew = () => navigate("/app/campaigns/new");

  return (
    <AppShell>
      <PageHeader
        title="Campaigns"
        description="Email your leads from your own connected email provider."
        docsPath={DOCS_SLUGS.quantalogCampaigns}
        actions={
          appOn && canCreate && campaigns.length > 0 ? (
            <Button leftSection={<Plus size={15} />} onClick={openNew}>
              New campaign
            </Button>
          ) : undefined
        }
      />

      {!appOn ? (
        <QuantalogAppGate app="campaigns" />
      ) : !sample && query.isLoading ? (
        <Skeleton height={280} radius="lg" />
      ) : !sample && query.isError && !query.currentData ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : !campaigns.length ? (
        <EmptyState
          icon={Mail}
          title="Send your first campaign"
          description="Write one email and send it to the people who answered your forms, or to a list of your own."
          action={canCreate ? { label: "New campaign", onClick: openNew } : undefined}
          actionNote={canCreate ? undefined : "An editor of this workspace can create campaigns."}
        />
      ) : (
        <>
          <div className={classes.sectionHead}>
            <h3 className={classes.sectionTitle}>Your campaigns</h3>
            {data?.usage && (
              <span className={classes.sectionMeta}>
                {data.usage.used.toLocaleString()} of {data.usage.limit.toLocaleString()} emails this month on the {data.usage.plan} plan
              </span>
            )}
          </div>
          <div className={classes.list}>
            {campaigns.map((campaign) => (
              <CampaignRow key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
