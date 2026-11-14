import { Button } from "@mantine/core";
import { Link } from "react-router-dom";
import { PanelSkeleton } from "@/shared/ui/Skeletons";
import { PageHeader } from "@/shared/ui/Page";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useBioStudio } from "@/features/bio/hooks/useBioStudio";
import { BIO_KIND_LABEL } from "@/features/bio/lib/bioOptions";
import type { BioTemplate } from "@/features/bio/templates/templateTypes";
import { DesignPanel } from "./DesignPanel";
import { EditorShell } from "./EditorShell";
import { LinksEditor } from "./LinksEditor";
import { PhonePreview } from "./PhonePreview";
import { ProfileHeaderEditor } from "./ProfileHeaderEditor";
import { ReleaseHeaderEditor } from "./ReleaseHeaderEditor";
import { ServicesEditor } from "./ServicesEditor";
import { SocialsEditor } from "./SocialsEditor";
import { Toggle } from "./ui/Toggle";
import classes from "./BioStudio.module.css";

export function BioStudioEditor({
  workspaceId,
  workspaceName,
  pageId,
  template,
  canEdit,
}: {
  workspaceId: string | undefined;
  workspaceName: string;
  pageId: string | undefined;
  template: BioTemplate | null;
  canEdit: boolean;
}) {
  const studio = useBioStudio(workspaceId, workspaceName, pageId, template);
  const { draft } = studio;
  const label = BIO_KIND_LABEL[draft.kind];
  useTitle(studio.isNew ? `New ${label.toLowerCase()}` : draft.title || label);

  const ready = Boolean(workspaceId && !studio.loading && !studio.notFound);

  return (
    <>
      <PageHeader
        title={studio.isNew ? `New ${label.toLowerCase()}` : draft.title || `Edit ${label.toLowerCase()}`}
        description={
          studio.isNew && template
            ? `Started from the ${template.name} template. Add your links on the left; the phone shows what visitors see.`
            : "Build it on the left. The phone shows exactly what visitors see."
        }
        docsPath={DOCS_SLUGS.quantalogBio}
        actions={
          ready && canEdit ? (
            <div className={classes.saveRow}>
              <span className={classes.liveToggle}>
                <Toggle
                  checked={draft.published}
                  label={draft.published ? "Make it a draft" : "Make it live"}
                  onChange={(published) => studio.set({ published })}
                />
                {draft.published ? "Live" : "Draft"}
              </span>
              {studio.isNew ? (
                <Button variant="subtle" color="gray" component={Link} to="/app/bio/new">
                  Change template
                </Button>
              ) : (
                <Button variant="default" component={Link} to="/app/bio">
                  Cancel
                </Button>
              )}
              <Button disabled={!studio.dirty} loading={studio.saving} onClick={() => void studio.save()}>
                {studio.isNew ? (draft.published ? "Publish" : "Save draft") : "Save changes"}
              </Button>
            </div>
          ) : undefined
        }
      />

      {studio.notFound ? (
        <ErrorState title="Page not found" description="It may have been deleted. Go back to see the rest." />
      ) : !ready ? (
        <div className={classes.studio}>
          <PanelSkeleton height={560} />
          <PanelSkeleton height={680} />
        </div>
      ) : (
        <div className={classes.studio}>
          <EditorShell
            disabled={!canEdit}
            content={
              draft.kind === "release" ? (
                <>
                  <ReleaseHeaderEditor draft={draft} onChange={studio.set} onReleaseChange={studio.setRelease} />
                  <ServicesEditor workspaceId={workspaceId} studio={studio} />
                </>
              ) : (
                <>
                  <ProfileHeaderEditor draft={draft} onChange={studio.set} />
                  <LinksEditor studio={studio} />
                  <SocialsEditor socials={draft.socials} onChange={studio.setSocials} />
                </>
              )
            }
            design={<DesignPanel draft={draft} onChange={studio.setTheme} />}
          />
          <div className={classes.previewCol}>
            <PhonePreview draft={draft} />
          </div>
        </div>
      )}
    </>
  );
}
