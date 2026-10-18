import { Button, Skeleton, Switch } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { usePopupStudio } from "@/features/popups/hooks/usePopupStudio";
import { FormSection } from "@/features/popups/components/studio/FormSection";
import { MomentSection } from "@/features/popups/components/studio/MomentSection";
import { StyleSection } from "@/features/popups/components/studio/StyleSection";
import { AudienceSection } from "@/features/popups/components/studio/AudienceSection";
import { FrequencySection } from "@/features/popups/components/studio/FrequencySection";
import { LivePreview } from "@/features/popups/components/studio/LivePreview";
import classes from "@/features/popups/components/studio/PopupStudio.module.css";

export default function PopupStudio() {
  const { popupId } = useParams<{ popupId: string }>();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { popups: popupsOn } = useWorkspaceApps();
  const workspaceId = active?._id;
  const studio = usePopupStudio(popupsOn ? workspaceId : undefined, popupId);
  const { draft } = studio;
  useTitle(studio.isNew ? "New popup" : draft.name || "Popup");

  const domain = studio.sites.find((s) => s.siteId === draft.siteId)?.domain ?? "";
  const ready = Boolean(popupsOn && workspaceId && !studio.loading && !studio.notFound);

  return (
    <AppShell>
      <Link to="/app/popups" className={classes.back}>
        <ArrowLeft size={15} />
        Popups
      </Link>
      <PageHeader
        title={studio.isNew ? "New popup" : draft.name || "Edit popup"}
        description="Set it up on the left. The preview on the right updates as you go."
        docsPath={DOCS_SLUGS.quantalogPopups}
        actions={
          ready && canEdit ? (
            <div className={classes.saveRow}>
              <Switch
                label={draft.enabled ? "Live" : "Paused"}
                checked={draft.enabled}
                onChange={(e) => studio.set({ enabled: e.currentTarget.checked })}
              />
              <Button variant="default" component={Link} to="/app/popups">
                Cancel
              </Button>
              <Button disabled={!studio.valid || !studio.dirty} loading={studio.saving} onClick={() => void studio.save()}>
                {studio.isNew ? (draft.enabled ? "Publish popup" : "Save popup") : "Save changes"}
              </Button>
            </div>
          ) : undefined
        }
      />

      {!popupsOn ? (
        <QuantalogAppGate app="popups" />
      ) : studio.notFound ? (
        <ErrorState title="Popup not found" description="It may have been deleted. Go back to Popups to see the rest." />
      ) : !ready || !workspaceId ? (
        <div className={classes.studio}>
          <Skeleton height={520} radius="lg" />
          <Skeleton height={560} radius="lg" />
        </div>
      ) : (
        <div className={classes.studio}>
          <fieldset className={classes.settings} disabled={!canEdit}>
            <FormSection workspaceId={workspaceId} draft={draft} sites={studio.sites} onChange={studio.set} />
            <MomentSection trigger={draft.trigger} onChange={studio.setTrigger} />
            <StyleSection layout={draft.layout} onChange={(layout) => studio.set({ layout })} />
            <AudienceSection draft={draft} onDevices={(devices) => studio.set({ devices })} onPages={studio.setPages} />
            <FrequencySection days={draft.showAgainDays} onChange={(showAgainDays) => studio.set({ showAgainDays })} />
          </fieldset>
          <div className={classes.previewCol}>
            <LivePreview draft={draft} domain={domain} />
          </div>
        </div>
      )}
    </AppShell>
  );
}
