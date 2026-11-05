import { useState } from "react";
import { Button, Skeleton } from "@mantine/core";
import { ArrowLeft, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { AppShell } from "@/app/AppShell";
import { ErrorState } from "@/shared/ui/ErrorState";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useTitle } from "@/shared/lib/useTitle";
import { useDemo } from "@/features/demo/context";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useGetCampaignSourcesQuery } from "@/features/campaigns/api";
import { useCampaignEditor } from "@/features/campaigns/hooks/useCampaignEditor";
import { AudienceSection } from "@/features/campaigns/components/editor/AudienceSection";
import { ContentSection } from "@/features/campaigns/components/editor/ContentSection";
import { EmailPreview } from "@/features/campaigns/components/editor/EmailPreview";
import { SendCampaignModal } from "@/features/campaigns/components/editor/SendCampaignModal";
import studio from "@/features/popups/components/studio/PopupStudio.module.css";

export default function CampaignEditor() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { demo } = useDemo();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { campaigns: appOn } = useWorkspaceApps();
  const workspaceId = appOn ? active?._id : undefined;
  const editor = useCampaignEditor(workspaceId, campaignId);
  const { draft } = editor;
  const writable = canEdit && !demo;
  const { currentData: sources } = useGetCampaignSourcesQuery(workspaceId && writable ? workspaceId : skipToken);
  const [sendingId, setSendingId] = useState<string | null>(null);
  useTitle(editor.isNew ? "New campaign" : draft.name || "Edit campaign");

  const review = async () => {
    const id = await editor.save();
    if (id) setSendingId(id);
  };

  return (
    <AppShell>
      <Link to="/app/campaigns" className={studio.back}>
        <ArrowLeft size={15} />
        Campaigns
      </Link>
      <PageHeader
        title={editor.isNew ? "New campaign" : draft.name || "Edit campaign"}
        description="Saving keeps it as a draft. Nothing is sent until you confirm."
        docsPath={DOCS_SLUGS.quantalogCampaigns}
        actions={
          appOn && writable && !editor.loading && !editor.locked ? (
            <div className={studio.saveRow}>
              <Button variant="default" loading={editor.saving} disabled={!draft.name.trim()} onClick={() => void editor.save()}>
                Save draft
              </Button>
              <Button leftSection={<Send size={15} />} disabled={!draft.name.trim() || editor.saving} onClick={() => void review()}>
                Review and send
              </Button>
            </div>
          ) : undefined
        }
      />

      {!appOn ? (
        <QuantalogAppGate app="campaigns" />
      ) : editor.notFound ? (
        <ErrorState title="Campaign not found" description="It may have been deleted. Go back to Campaigns to see the rest." />
      ) : editor.loading ? (
        <div className={studio.studio}>
          <Skeleton height={520} radius="lg" />
          <Skeleton height={520} radius="lg" />
        </div>
      ) : editor.locked ? (
        <ErrorState title="This campaign was already sent" description="A sent campaign cannot be changed. Create a new one instead." />
      ) : (
        <div className={studio.studio}>
          <fieldset className={studio.settings} disabled={!writable}>
            <ContentSection draft={draft} onChange={editor.set} />
            <AudienceSection draft={draft} sources={sources} onChange={editor.set} />
          </fieldset>
          <div className={studio.previewCol}>
            <EmailPreview workspaceId={writable ? workspaceId : undefined} draft={draft} sources={sources} onSave={editor.save} />
          </div>
        </div>
      )}

      {workspaceId && <SendCampaignModal workspaceId={workspaceId} campaignId={sendingId} onClose={() => setSendingId(null)} />}
    </AppShell>
  );
}
