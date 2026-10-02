import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteDashboardMutation, useDuplicateDashboardMutation } from "@/features/dashboards/api";
import { confirmDelete, errMessage, notify, notifyError } from "@/shared/lib/notify";
import type { CardBusy } from "@/features/dashboards/components/home/cardBusy";
import type { Dashboard } from "@/features/dashboards/types";

export function useDashboardActions(workspaceId: string | undefined) {
  const navigate = useNavigate();
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
    confirmDelete({
      title: "Delete dashboard?",
      body: <>“{d.name}” and its layout will be removed. Your analytics data is not affected.</>,
      onConfirm: after
        ? async () => {
            try {
              await remove({ workspaceId, id: d.id }).unwrap();
              notify.success(`“${d.name}” deleted.`, "Dashboards");
              after();
            } catch (e) {
              notify.error(errMessage(e, "Could not delete the dashboard."));
            }
          }
        : () => {
            mark(d.id, "deleting");
            remove({ workspaceId, id: d.id })
              .unwrap()
              .then(() => notify.success(`“${d.name}” deleted.`, "Dashboards"))
              .catch((e) => notify.error(errMessage(e, "Could not delete the dashboard.")))
              .finally(() => mark(d.id, null));
          },
    });
  };

  return { duplicateDashboard, deleteDashboard, busy };
}
