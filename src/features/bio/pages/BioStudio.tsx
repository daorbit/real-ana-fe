import { ArrowLeft } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useBioPages } from "@/features/bio/hooks/useBioPages";
import { useBioAllowances } from "@/features/bio/hooks/useBioAllowances";
import { TemplateGallery } from "@/features/bio/components/templates/TemplateGallery";
import { BioStudioEditor } from "@/features/bio/components/studio/BioStudioEditor";
import { templateById } from "@/features/bio/templates/bioTemplates";
import classes from "@/features/bio/components/studio/BioStudio.module.css";

function TemplateChooser({ workspaceId }: { workspaceId: string | undefined }) {
  useTitle("Choose a template");
  const [, setParams] = useSearchParams();
  const { pages } = useBioPages(workspaceId);
  const allowances = useBioAllowances(pages);

  return (
    <>
      <PageHeader
        title="Choose a template"
        description="Pick the one closest to what you need. You can change every word, colour and button after."
        docsPath={DOCS_SLUGS.quantalogBio}
      />
      <TemplateGallery
        onPick={(template) => allowances.of(template.kind).guard(() => setParams({ template: template.id }, { replace: true }))}
      />
    </>
  );
}

export default function BioStudio() {
  const { pageId } = useParams<{ pageId: string }>();
  const [params] = useSearchParams();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { bio: bioOn } = useWorkspaceApps();
  const workspaceId = bioOn ? active?._id : undefined;
  const template = templateById(params.get("template"));

  return (
    <AppShell>
      <Link to="/app/bio" className={classes.back}>
        <ArrowLeft size={15} />
        Link-in-bio
      </Link>

      {!bioOn ? (
        <QuantalogAppGate app="bio" />
      ) : !pageId && !template ? (
        <TemplateChooser workspaceId={workspaceId} />
      ) : (
        <BioStudioEditor
          key={pageId ?? template?.id}
          workspaceId={workspaceId}
          workspaceName={active?.name ?? ""}
          pageId={pageId}
          template={pageId ? null : template}
          canEdit={canEdit}
        />
      )}
    </AppShell>
  );
}
