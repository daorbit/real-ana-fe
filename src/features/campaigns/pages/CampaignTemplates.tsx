import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useTitle } from "@/shared/lib/useTitle";
import { useDemo } from "@/features/demo/context";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useGetCampaignsQuery } from "@/features/campaigns/api";
import { TemplatePicker } from "@/features/campaigns/components/TemplatePicker";
import classes from "@/features/campaigns/components/Campaigns.module.css";
import editor from "@/features/campaigns/components/editor/Editor.module.css";

export default function CampaignTemplates() {
  useTitle("New campaign");
  const { demo } = useDemo();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { campaigns: appOn } = useWorkspaceApps();
  const workspaceId = appOn && !demo ? active?._id : undefined;
  const { currentData } = useGetCampaignsQuery(workspaceId && canEdit ? workspaceId : skipToken);
  const lastAddress = currentData?.campaigns[0]?.senderAddress ?? "";

  return (
    <AppShell>
      <div className={editor.topbar}>
        <Link to="/app/campaigns" className={editor.back}>
          <ChevronLeft size={17} aria-hidden />
          Campaigns
        </Link>
      </div>
      <PageHeader
        title="Start with a template"
        description="Pick a starting point. You can change every word, colour and block in the editor."
        docsPath={DOCS_SLUGS.quantalogCampaigns}
      />
      {!appOn ? (
        <QuantalogAppGate app="campaigns" />
      ) : canEdit && !demo ? (
        <TemplatePicker workspaceId={workspaceId} lastAddress={lastAddress} />
      ) : (
        <p className={classes.none}>An editor of this workspace can create campaigns.</p>
      )}
    </AppShell>
  );
}
