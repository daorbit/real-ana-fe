import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { hideDashboard, useDeleteDashboardMutation, useDuplicateDashboardMutation } from "@/features/dashboards/api";
import { notify, notifyError } from "@/shared/lib/notify";
import { deferDelete } from "@/shared/lib/deferDelete";
import type { AppDispatch } from "@/app/store";
import type { CardBusy } from "@/features/dashboards/components/home/cardBusy";
import type { Dashboard } from "@/features/dashboards/types";

export function useDashboardActions(workspaceId: string | undefined, demo = false) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [duplicate] = useDuplicateDashboardMutation();
  const [remove] = useDeleteDashboardMutation();
  const [busy, setBusy] = useState<Record<string, CardBusy>>({});

  const mark = (id: string, state: CardBusy) =>
    setBusy((b) => {
      const next = { ...b };
      if (state) next[id] = state;
      else delete next[id];
      return next;
    });

  const duplicateDashboard = async (d: Dashboard, open = false) => {
    if (!workspaceId || busy[d.id]) return;
    if (demo) {
      notify.error("Turn off demo data to duplicate a dashboard.");
      return;
    }
    mark(d.id, "duplicating");
    try {
      const copy = await duplicate({ workspaceId, id: d.id }).unwrap();
      notify.success(`“${copy.name}” is ready.`, "Dashboard duplicated");
      if (open) navigate(`/app/dashboards/${copy.id}`);
    } catch (e) {
      notifyError(e, "Could not duplicate the dashboard.");
    } finally {
      mark(d.id, null);
    }
  };

  const deleteDashboard = (d: Dashboard, after?: () => void) => {
    if (!workspaceId) return;
    if (demo) {
      notify.error("Turn off demo data to delete a dashboard.");
      return;
    }
    deferDelete({
      key: `dashboard:${d.id}`,
      message: `“${d.name}” deleted`,
      errorMessage: "Could not delete the dashboard.",
      hide: () => dispatch(hideDashboard(workspaceId, d.id)),
      commit: () => remove({ workspaceId, id: d.id }).unwrap(),
      onUndo: after ? () => navigate(`/app/dashboards/${d.id}`) : undefined,
    });
    after?.();
  };

  return { duplicateDashboard, deleteDashboard, busy };
}
