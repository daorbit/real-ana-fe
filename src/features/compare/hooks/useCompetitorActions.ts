import { useState } from "react";
import {
  useAddCompetitorMutation, useRefreshCompetitorMutation, useRefreshAllCompetitorsMutation,
  useDeleteCompetitorMutation,
} from "@/app/store";
import { notify, notifyError, confirmDelete } from "@/shared/lib/notify";

export function useCompetitorActions(
  workspaceId: string, siteId: string, domain: string | undefined, demo = false,
) {
  const [addCompetitor, { isLoading: adding }] = useAddCompetitorMutation();
  const [refreshCompetitor] = useRefreshCompetitorMutation();
  const [refreshAll, { isLoading: refreshingAll }] = useRefreshAllCompetitorsMutation();
  const [deleteCompetitor] = useDeleteCompetitorMutation();
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const site = domain ?? "your site";

  const add = async (url: string): Promise<boolean> => {
    if (demo) {
      notify.error("Turn off demo data to add a competitor.");
      return false;
    }
    const trimmed = url.trim();
    if (!trimmed) return false;
    try {
      await addCompetitor({ workspaceId, siteId, url: trimmed }).unwrap();
      notify.success(`Fetched and compared against ${site}.`, "Competitor added");
      return true;
    } catch (e) {
      notifyError(e, "Could not add competitor");
      return false;
    }
  };

  const refreshOne = async (competitorId: string) => {
    if (demo) {
      notify.error("Turn off demo data to refresh a competitor.");
      return;
    }
    setRefreshingId(competitorId);
    try {
      await refreshCompetitor({ workspaceId, siteId, competitorId }).unwrap();
    } catch (e) {
      notifyError(e, "Refresh failed");
    } finally {
      setRefreshingId(null);
    }
  };

  const refreshEveryone = async () => {
    if (demo) {
      notify.error("Turn off demo data to refresh competitors.");
      return;
    }
    try {
      const result = await refreshAll({ workspaceId, siteId }).unwrap();
      notify.success(
        result.failed > 0
          ? `${result.refreshed} re-fetched, ${result.failed} could not be reached.`
          : `${result.refreshed} re-fetched against ${site}.`,
        "Comparison updated",
      );
    } catch (e) {
      notifyError(e, "Refresh failed");
    }
  };

  const remove = (competitorId: string, label: string) => {
    if (demo) {
      notify.error("Turn off demo data to remove a competitor.");
      return;
    }
    confirmDelete({
      title: "Remove competitor",
      body: `Stop tracking ${label}? Their recorded score history goes too.`,
      onConfirm: async () => {
        try {
          await deleteCompetitor({ workspaceId, siteId, competitorId }).unwrap();
        } catch (e) {
          notifyError(e, "Could not remove competitor");
        }
      },
    });
  };

  return { add, adding, refreshOne, refreshingId, refreshEveryone, refreshingAll, remove };
}
