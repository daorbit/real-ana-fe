import { useState } from "react";
import {
  useAddCompetitorMutation, useRefreshCompetitorMutation, useRefreshAllCompetitorsMutation,
  useDeleteCompetitorMutation,
} from "@/app/store";
import { notify, notifyError, confirmDelete } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";

export function useCompetitorActions(workspaceId: string, siteId: string, domain: string | undefined) {
  const { user } = useAuth();
  const [addCompetitor, { isLoading: adding }] = useAddCompetitorMutation();
  const [refreshCompetitor] = useRefreshCompetitorMutation();
  const [refreshAll, { isLoading: refreshingAll }] = useRefreshAllCompetitorsMutation();
  const [deleteCompetitor] = useDeleteCompetitorMutation();
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const site = domain ?? "your site";

  const add = async (url: string): Promise<boolean> => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    trace(user?.id, "add_competitor", "compare", "competitor_added");
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
    trace(user?.id, "refresh_competitor", "compare", "competitor_analysis");
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
    trace(user?.id, "refresh_all_competitors", "compare", "competitor_analysis");
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
    confirmDelete({
      title: "Remove competitor",
      body: `Stop tracking ${label}? Their recorded score history goes too.`,
      onConfirm: async () => {
        trace(user?.id, "remove_competitor", "compare", "competitor_removed");
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
