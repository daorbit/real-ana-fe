import { useMemo, useState } from "react";
import { Button } from "@mantine/core";
import { LayoutTemplate } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/shared/ui/Page";
import { ErrorState } from "@/shared/ui/ErrorState";
import { notify } from "@/shared/lib/notify";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useBioStudio } from "@/features/bio/hooks/useBioStudio";
import { BIO_KIND_LABEL } from "@/features/bio/lib/bioOptions";
import { templateForTheme } from "@/features/bio/templates/bioTemplates";
import type { BioTemplate } from "@/features/bio/templates/templateTypes";
import { TemplateSwitcher } from "../templates/TemplateSwitcher";
import { BioStudioSkeleton } from "./BioStudioSkeleton";
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
  const [switching, setSwitching] = useState(false);
  const { draft } = studio;
  const current = useMemo(() => templateForTheme(draft.theme), [draft.theme]);
  const label = BIO_KIND_LABEL[draft.kind];
  useTitle(studio.isNew ? `New ${label.toLowerCase()}` : draft.title || label);

  const ready = Boolean(workspaceId && !studio.loading && !studio.notFound);

  return (
    <>
      <PageHeader
        title={studio.isNew ? `New ${label.toLowerCase()}` : draft.title || `Edit ${label.toLowerCase()}`}
        description={
          current
            ? `Using the ${current.name} template. Add your links on the left; the phone shows what visitors see.`
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
              <Button variant="default" leftSection={<LayoutTemplate size={15} />} onClick={() => setSwitching(true)}>
                Change template
              </Button>
              {!studio.isNew && (
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
        <BioStudioSkeleton />
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

      <TemplateSwitcher
        opened={switching}
        draft={draft}
        onClose={() => setSwitching(false)}
        onPick={(next) => {
          studio.applyTemplate(next);
          notify.success(`Switched to ${next.name}. Save to keep it.`, "Link-in-bio");
        }}
      />
    </>
  );
}
