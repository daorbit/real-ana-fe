import { useCallback, useMemo, useState } from "react";
import { useGetSitesQuery } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { demoSites } from "@/features/demo/demoData";
import { POLL_MS } from "@/shared/hooks/usePolling";
import type { Site } from "@/shared/types";

/**
 * The sites belonging to a workspace.
 *
 * Cached by RTK Query, so switching pages serves the list instantly. Creating
 * or deleting a site invalidates the Site tag, which refetches this
 * automatically — callers no longer have to reload by hand.
 */
export function useSites(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const { data, currentData, refetch, fulfilledTimeStamp, originalArgs } = useGetSitesQuery(
    workspaceId!,
    {
      skip: !workspaceId || demo,
      pollingInterval: POLL_MS,
      // A backgrounded tab is not being looked at, and polling it on a timer
      // is load the server carries for nobody. The refetch on focus is what
      // catches the list up when someone comes back.
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
    },
  );

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

  /**
   * Never serve another workspace's sites while this one loads.
   *
   * `data` survives a cache-key change by design, so a plain `data ?? []` left
   * the previous workspace's site list on screen for the length of the fetch —
   * long enough to click into a site that isn't in the workspace you just
   * opened. Empty is the honest answer until the right list arrives.
   */
  const sites: Site[] = (currentData ?? (originalArgs === workspaceId ? data : undefined)) ?? [];

  const sample = useMemo(
    () => (demo ? demoSites.filter((s) => s.workspaceId === workspaceId) : null),
    [demo, workspaceId],
  );

  if (sample) {
    return {
      sites: sample,
      reload: refetch,
      refresh,
      refreshing: false,
      lastUpdated: null,
    };
  }

  return {
    sites,
    // Kept for callers that still trigger a manual reload after a mutation.
    reload: refetch,
    refresh,
    refreshing,
    lastUpdated: fulfilledTimeStamp ? new Date(fulfilledTimeStamp) : null,
  };
}
