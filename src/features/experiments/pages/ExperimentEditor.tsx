import { Button } from "@mantine/core";
import { PanelSkeleton } from "@/shared/ui/Skeletons";
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
import { useExperimentEditor } from "@/features/experiments/hooks/useExperimentEditor";
import { BasicsSection } from "@/features/experiments/components/editor/BasicsSection";
import { TargetingSection } from "@/features/experiments/components/editor/TargetingSection";
import { GoalSection } from "@/features/experiments/components/editor/GoalSection";
import { VariantsSection } from "@/features/experiments/components/editor/VariantsSection";
import { EditorAside } from "@/features/experiments/components/editor/EditorAside";
import studio from "@/features/popups/components/studio/PopupStudio.module.css";

export default function ExperimentEditor() {
  const { experimentId } = useParams<{ experimentId: string }>();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { experiments: appOn } = useWorkspaceApps();
  const workspaceId = appOn ? active?._id : undefined;
  const editor = useExperimentEditor(workspaceId, experimentId);
  const { draft } = editor;
  useTitle(editor.isNew ? "New A/B test" : draft.name || "Edit A/B test");
  const backTo = editor.isNew ? "/app/experiments" : `/app/experiments/${experimentId}`;

  return (
    <AppShell>
      <Link to={backTo} className={studio.back}>
        <ArrowLeft size={15} />
        {editor.isNew ? "A/B tests" : "Back to results"}
      </Link>
      <PageHeader
        title={editor.isNew ? "New A/B test" : draft.name || "Edit A/B test"}
        description="Set it up on the left. Saving keeps it as a draft until you start it."
        docsPath={DOCS_SLUGS.quantalogExperiments}
        actions={
          appOn && canEdit && !editor.loading && !editor.locked ? (
            <div className={studio.saveRow}>
              <Button variant="default" component={Link} to={backTo}>
                Cancel
              </Button>
              <Button loading={editor.saving} disabled={Boolean(editor.problem)} onClick={() => void editor.save()}>
                {editor.isNew ? "Save draft" : "Save changes"}
              </Button>
            </div>
          ) : undefined
        }
      />

      {!appOn ? (
        <QuantalogAppGate app="experiments" />
      ) : editor.notFound ? (
        <ErrorState title="Test not found" description="It may have been deleted. Go back to A/B tests to see the rest." />
      ) : editor.loading ? (
        <div className={studio.studio}>
          <PanelSkeleton height={520} />
          <PanelSkeleton height={360} />
        </div>
      ) : editor.locked ? (
        <ErrorState
          title="Pause the test to change it"
          description="Changing a running test would mix two versions in one result. Pause it first, or duplicate an ended test."
        />
      ) : (
        <div className={studio.studio}>
          <fieldset className={studio.settings} disabled={!canEdit}>
            <BasicsSection draft={draft} sites={editor.sites} onChange={editor.set} />
            <TargetingSection draft={draft} onChange={editor.set} />
            <GoalSection draft={draft} onChange={editor.set} />
            <VariantsSection
              draft={draft}
              onVariant={editor.setVariant}
              onChange={editor.setChange}
              onAddChange={editor.addChange}
              onRemoveChange={editor.removeChange}
              onCount={editor.setVariantCount}
            />
          </fieldset>
          <div className={studio.previewCol}>
            <EditorAside draft={draft} />
          </div>
        </div>
      )}
    </AppShell>
  );
}
