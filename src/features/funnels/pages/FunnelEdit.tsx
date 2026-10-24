import { useEffect, useMemo } from "react";
import { Lock, SearchX } from "lucide-react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { RangePicker } from "@/features/analytics/components/RangePicker";
import type { FunnelStepInput } from "@/shared/types";
import { useFunnelEditor } from "../hooks/useFunnelEditor";
import { useFunnelMutations } from "../hooks/useFunnelMutations";
import { useFunnelRange, withSearch } from "../hooks/useFunnelRange";
import { useFunnelRun } from "../hooks/useFunnelRun";
import { useFunnelSites } from "../hooks/useFunnelSites";
import { useFunnelSourceStats } from "../hooks/useFunnelSourceStats";
import { useSavedFunnel } from "../hooks/useSavedFunnels";
import { isRunnable, suggestedName } from "../lib/funnelDraft";
import { funnelPresets } from "../lib/funnelPresets";
import { stepOptions } from "../lib/funnelOptions";
import { rangeLabel } from "../lib/funnelFormat";
import { BackLink } from "../components/BackLink";
import { FunnelForm } from "../components/FunnelForm";
import { FunnelPreview } from "../components/FunnelPreview";
import classes from "../components/Funnels.module.css";

type DuplicateState = { name?: string; steps?: FunnelStepInput[] } | null;

export default function FunnelEdit() {
  const { funnelId } = useParams();
  const editing = Boolean(funnelId);
  useTitle(editing ? "Edit funnel" : "New funnel");
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const presetKey = params.get("preset");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { funnels: on } = useWorkspaceApps();
  const workspaceId = active?._id;
  const { range, setRange, search } = useFunnelRange();
  const sites = useFunnelSites(workspaceId);
  const editor = useFunnelEditor();
  const { funnel, missing } = useSavedFunnel(workspaceId, funnelId, on && editing);
  const { stats } = useFunnelSourceStats(workspaceId, range, sites, on && canEdit);
  const { report, running } = useFunnelRun(workspaceId, editor.steps, range, sites, false);
  const { save, saving } = useFunnelMutations(workspaceId);

  const presets = useMemo(() => funnelPresets(stats), [stats]);
  const groups = useMemo(() => stepOptions(stats, editor.steps), [stats, editor.steps]);
  const duplicate = location.state as DuplicateState;
  const { load } = editor;

  useEffect(() => {
    if (editing) {
      if (funnel) load({ name: funnel.name, steps: funnel.steps });
      return;
    }
    if (duplicate?.steps?.length) {
      load({ name: duplicate.name, steps: duplicate.steps });
      return;
    }
    if (presetKey) {
      const preset = presets.find((p) => p.key === presetKey);
      if (preset) load({ steps: preset.steps });
    }
  }, [editing, funnel, duplicate, presetKey, presets, load]);

  const cleanSearch = useMemo(() => {
    const next = new URLSearchParams(search);
    next.delete("preset");
    return next.toString();
  }, [search]);
  const cancelTo = withSearch(editing && funnelId ? `/app/funnels/${funnelId}` : "/app/funnels", cleanSearch);

  const handleSave = async () => {
    const name = editor.name.trim() || suggestedName(editor.steps);
    const id = await save(name, editor.steps, funnelId ?? null);
    if (id) navigate(withSearch(`/app/funnels/${id}`, cleanSearch), { replace: true });
  };

  return (
    <AppShell>
      <BackLink to={cancelTo} label={editing ? "Back to funnel" : "All funnels"} />
      <PageHeader
        title={editing ? "Edit funnel" : "New funnel"}
        description="Pick the pages and events that lead to a signup or a sale, in the order visitors take them."
        docsPath={DOCS_SLUGS.funnels}
        actions={on && canEdit ? <RangePicker value={range} onChange={setRange} /> : undefined}
      />

      {!active ? null : !on ? (
        <QuantalogAppGate app="funnels" />
      ) : !canEdit ? (
        <EmptyState
          icon={Lock}
          title="You can view funnels but not change them"
          description="Ask an editor or admin in this workspace to create or edit funnels."
          action={{ label: "Back to all funnels", to: "/app/funnels" }}
        />
      ) : editing && missing ? (
        <EmptyState
          icon={SearchX}
          title="This funnel no longer exists"
          description="It may have been deleted by someone else in your workspace."
          action={{ label: "Back to all funnels", to: "/app/funnels" }}
        />
      ) : (
        <div className={classes.editLayout}>
          <FunnelForm
            name={editor.name}
            namePlaceholder={suggestedName(editor.steps)}
            steps={editor.steps}
            groups={groups}
            canSave={isRunnable(editor.steps)}
            saving={saving}
            saveLabel={editing ? "Save changes" : "Create funnel"}
            cancelTo={cancelTo}
            onNameChange={editor.setName}
            onStepChange={editor.setStep}
            onAddStep={editor.addStep}
            onMoveStep={editor.moveStep}
            onRemoveStep={editor.removeStep}
            onSave={handleSave}
          />
          <FunnelPreview report={report} running={running} ready={isRunnable(editor.steps)} rangeLabel={rangeLabel(range.preset)} />
        </div>
      )}
    </AppShell>
  );
}
