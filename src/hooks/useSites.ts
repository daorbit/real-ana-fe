import { useCallback, useState } from "react";
import { useGetSitesQuery } from "../store";
import { POLL_MS } from "./usePolling";
import type { Site } from "../types";

/**
 * The sites belonging to a workspace.
 *
 * Cached by RTK Query, so switching pages serves the list instantly. Creating
 * or deleting a site invalidates the Site tag, which refetches this
 * automatically — callers no longer have to reload by hand.
 */
export function useSites(workspaceId: string | undefined) {
  const { data, refetch, fulfilledTimeStamp } = useGetSitesQuery(workspaceId!, {
    skip: !workspaceId,
    pollingInterval: POLL_MS,
  });

  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch().unwrap();
    } catch {
      /* nothing useful to say — the list simply stays as it was */
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const sites: Site[] = data ?? [];

  return {
    sites,
    // Kept for callers that still trigger a manual reload after a mutation.
    reload: refetch,
    refresh,
    refreshing,
    lastUpdated: fulfilledTimeStamp ? new Date(fulfilledTimeStamp) : null,
  };
}
