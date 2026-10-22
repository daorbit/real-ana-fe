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
import { useBioStudio } from "@/features/bio/hooks/useBioStudio";
import { ProfileSection } from "@/features/bio/components/studio/ProfileSection";
import { LinksSection } from "@/features/bio/components/studio/LinksSection";
import { SocialsSection } from "@/features/bio/components/studio/SocialsSection";
import { AppearanceSection } from "@/features/bio/components/studio/AppearanceSection";
import { PhonePreview } from "@/features/bio/components/studio/PhonePreview";
import classes from "@/features/bio/components/studio/BioStudio.module.css";

export default function BioStudio() {
  const { pageId } = useParams<{ pageId: string }>();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { bio: bioOn } = useWorkspaceApps();
  const workspaceId = active?._id;
  const studio = useBioStudio(bioOn ? workspaceId : undefined, active?.name ?? "", pageId);
  const { draft } = studio;
  useTitle(studio.isNew ? "New page" : draft.title || "Link in bio");

  const ready = Boolean(bioOn && workspaceId && !studio.loading && !studio.notFound);

  return (
    <AppShell>
      <Link to="/app/bio" className={classes.back}>
        <ArrowLeft size={15} />
        Link in bio
      </Link>
      <PageHeader
        title={studio.isNew ? "New page" : draft.title || "Edit page"}
        description="Build it on the left. The phone shows exactly what visitors see."
        docsPath={DOCS_SLUGS.quantalogBio}
        actions={
          ready && canEdit ? (
            <div className={classes.saveRow}>
              <Switch
                label={draft.published ? "Live" : "Draft"}
                checked={draft.published}
                onChange={(e) => studio.set({ published: e.currentTarget.checked })}
              />
              <Button variant="default" component={Link} to="/app/bio">
                Cancel
              </Button>
              <Button disabled={!studio.dirty} loading={studio.saving} onClick={() => void studio.save()}>
                {studio.isNew ? (draft.published ? "Publish page" : "Save draft") : "Save changes"}
              </Button>
            </div>
          ) : undefined
        }
      />

      {!bioOn ? (
        <QuantalogAppGate app="bio" />
      ) : studio.notFound ? (
        <ErrorState title="Page not found" description="It may have been deleted. Go back to Link in bio to see the rest." />
      ) : !ready ? (
        <div className={classes.studio}>
          <Skeleton height={560} radius="lg" />
          <Skeleton height={680} radius={36} />
        </div>
      ) : (
        <div className={classes.studio}>
          <fieldset className={classes.settings} disabled={!canEdit}>
            <ProfileSection draft={draft} isNew={studio.isNew} onChange={studio.set} />
            <LinksSection
              links={draft.links}
              linkClicks={studio.stats?.linkClicks}
              onAdd={studio.addLink}
              onUpdate={studio.updateLink}
              onRemove={studio.removeLink}
              onMove={studio.moveLink}
            />
            <SocialsSection socials={draft.socials} onChange={studio.setSocials} />
            <AppearanceSection theme={draft.theme} onChange={studio.setTheme} />
          </fieldset>
          <div className={classes.previewCol}>
            <PhonePreview draft={draft} />
          </div>
        </div>
      )}
    </AppShell>
  );
}
