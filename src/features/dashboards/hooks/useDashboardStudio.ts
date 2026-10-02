import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sanitiseLayout } from "@/features/analytics";
import { notify, notifyError } from "@/shared/lib/notify";
import { addedWidgets, draftChanges } from "@/features/dashboards/draftChanges";
import { useDashboardOrbit } from "@/features/dashboards/hooks/useDashboardOrbit";
import { useCreateDashboard } from "@/features/dashboards/hooks/useCreateDashboard";
import { usePatchDashboard } from "@/features/dashboards/hooks/usePatchDashboard";
import type { Dashboard, DashboardDraft } from "@/features/dashboards/types";

export type FreshLocationState = { fresh?: string[] } | null;

function toDraft(d: Dashboard): DashboardDraft {
  return { name: d.name, description: d.description, range: d.range, layout: sanitiseLayout(d.layout) };
}

export function useDashboardStudio(workspaceId: string | undefined, dashboard: Dashboard | undefined) {
  const navigate = useNavigate();
  const mode = dashboard ? "edit" : "create";
  const base = useMemo(() => (dashboard ? toDraft(dashboard) : undefined), [dashboard]);
  const [picked, setPicked] = useState<string | null>(null);
  const [rename, setRename] = useState<{ id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const { createFromDraft, creating } = useCreateDashboard(workspaceId);
  const { patch } = usePatchDashboard(workspaceId, dashboard?.id);

  const orbit = useDashboardOrbit({
    workspaceId,
    mode,
    base,
    scope: `${mode}:${dashboard?.id ?? ""}`,
    focusId: picked,
  });

  useEffect(() => setPicked(null), [orbit.latestVersionId]);

  const selected = orbit.versions.find((v) => v.id === picked) ?? orbit.versions[orbit.versions.length - 1];
  const source = selected?.draft ?? base;
  const name = rename && selected && rename.id === selected.id ? rename.name : source?.name ?? "";
  const draft: DashboardDraft | undefined = source && { ...source, name: name.trim() || source.name };
  const reference = mode === "edit" ? base : selected?.base;
  const changes = draft && selected ? draftChanges(reference, draft) : [];

  const canSubmit = Boolean(selected && draft && draft.layout.length > 0 && (mode === "create" || changes.length > 0));

  const submit = async () => {
    if (!draft || !canSubmit) return;
    if (mode === "create") {
      await createFromDraft(draft);
      return;
    }
    setSaving(true);
    try {
      await patch({ name: draft.name, description: draft.description, range: draft.range, layout: draft.layout });
      notify.success("Orbit's changes are saved.", "Dashboard updated");
      const state: FreshLocationState = { fresh: addedWidgets(base, draft) };
      navigate(`/app/dashboards/${dashboard?.id}`, { state });
    } catch (e) {
      notifyError(e, "Could not update the dashboard.");
    } finally {
      setSaving(false);
    }
  };

  return {
    mode,
    orbit,
    base,
    selected,
    select: setPicked,
    draft,
    name,
    setName: (value: string) => {
      if (selected) setRename({ id: selected.id, name: value });
    },
    changes,
    canSubmit,
    submitting: saving || Boolean(creating),
    creating,
    submit,
    startOver: () => {
      setPicked(null);
      setRename(null);
      orbit.reset();
    },
  };
}

export type DashboardStudio = ReturnType<typeof useDashboardStudio>;
