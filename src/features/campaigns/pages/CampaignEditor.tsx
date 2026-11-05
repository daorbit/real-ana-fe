import { useState } from "react";
import { Button, SegmentedControl, Skeleton } from "@mantine/core";
import { ChevronLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { AppShell } from "@/app/AppShell";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useTitle } from "@/shared/lib/useTitle";
import { useDemo } from "@/features/demo/context";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useGetCampaignSourcesQuery } from "@/features/campaigns/api";
import { useCampaignEditor } from "@/features/campaigns/hooks/useCampaignEditor";
import { AudienceSection } from "@/features/campaigns/components/editor/AudienceSection";
import { BlockList } from "@/features/campaigns/components/editor/BlockList";
import { ContentSection } from "@/features/campaigns/components/editor/ContentSection";
import { EmailPreview } from "@/features/campaigns/components/editor/EmailPreview";
import { HtmlSection } from "@/features/campaigns/components/editor/HtmlSection";
import { SendCampaignModal } from "@/features/campaigns/components/editor/SendCampaignModal";
import { StyleSection } from "@/features/campaigns/components/editor/StyleSection";
import type { CampaignMode } from "@/features/campaigns/types";
import classes from "@/features/campaigns/components/editor/Editor.module.css";

export default function CampaignEditor() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { demo } = useDemo();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { campaigns: appOn } = useWorkspaceApps();
  const workspaceId = appOn ? active?._id : undefined;
  const writable = canEdit && !demo;
  const editor = useCampaignEditor(workspaceId, campaignId);
  const { draft } = editor;
  const { currentData: sources } = useGetCampaignSourcesQuery(workspaceId && writable ? workspaceId : skipToken);
  const [sendingId, setSendingId] = useState<string | null>(null);
  useTitle(draft?.name || "Campaign");

  const review = async () => {
    if (campaignId && (await editor.save())) setSendingId(campaignId);
  };

  const savedLabel = editor.saving ? "Saving" : editor.dirty ? "Unsaved changes" : "Saved";

  return (
    <AppShell>
      <div className={classes.topbar}>
        <Link to="/app/campaigns" className={classes.back}>
          <ChevronLeft size={17} aria-hidden />
          Campaigns
        </Link>
        {appOn && writable && draft && !editor.locked && (
          <div className={classes.actions}>
            <span className={classes.saved} aria-live="polite">{savedLabel}</span>
            <Button onClick={() => void review()} disabled={!draft.name.trim() || editor.saving}>
              Review and send
            </Button>
          </div>
        )}
      </div>

      {!appOn ? (
        <QuantalogAppGate app="campaigns" />
      ) : editor.notFound ? (
        <ErrorState title="Campaign not found" description="It may have been deleted. Go back to Campaigns to see the rest." />
      ) : editor.loading || !draft ? (
        <div className={classes.layout}>
          <Skeleton height={520} radius="lg" />
          <Skeleton height={520} radius="lg" />
        </div>
      ) : editor.locked ? (
        <ErrorState title="This campaign was already sent" description="A sent campaign can't be changed. Create a new one instead." />
      ) : (
        <>
          <input
            className={classes.title}
            aria-label="Campaign name"
            placeholder="Name this campaign"
            maxLength={120}
            value={draft.name}
            onChange={(e) => editor.set("name", e.currentTarget.value)}
          />
          <div className={classes.layout}>
            <fieldset className={classes.settings} disabled={!writable}>
              <SegmentedControl
                fullWidth
                aria-label="How to build this email"
                data={[{ value: "design", label: "Design" }, { value: "html", label: "Custom HTML" }]}
                value={draft.mode}
                onChange={(mode) => editor.set("mode", mode as CampaignMode)}
              />
              <ContentSection draft={draft} sources={sources} onChange={editor.set} />
              {draft.mode === "html" ? (
                <HtmlSection html={draft.html} onChange={(html) => editor.set("html", html)} />
              ) : (
                <>
                  <BlockList
                    blocks={draft.design.blocks}
                    expandedId={editor.expandedId}
                    onExpand={editor.setExpandedId}
                    onReorder={editor.setBlocks}
                    onChange={editor.updateBlock}
                    onAdd={editor.addBlock}
                    onDuplicate={editor.duplicateBlock}
                    onRemove={editor.removeBlock}
                  />
                  <StyleSection theme={draft.design.theme} onChange={editor.setTheme} />
                </>
              )}
              <AudienceSection draft={draft} sources={sources} onChange={editor.set} />
            </fieldset>
            <div className={classes.previewCol}>
              <EmailPreview workspaceId={writable ? workspaceId : undefined} campaignId={campaignId} draft={draft} onSave={editor.save} />
            </div>
          </div>
        </>
      )}

      {workspaceId && <SendCampaignModal workspaceId={workspaceId} campaignId={sendingId} onClose={() => setSendingId(null)} />}
    </AppShell>
  );
}
