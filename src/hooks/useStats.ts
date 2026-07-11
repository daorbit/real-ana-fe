import { useCallback, useEffect, useRef, useState } from "react";
import { useGetStatsQuery } from "../store";
import { notify, errMessage } from "../notify";
import { POLL_MS } from "./usePolling";

/**
 * Aggregated analytics for a workspace.
 *
 * Backed by the RTK Query cache: mounting this on a second page serves the
 * cached payload instantly and fires no request. The data refreshes only when
 * the 60s poll ticks, a mutation invalidates the Stats tag, or the user hits
 * Refresh.
 */
export function useStats(workspaceId: string | undefined, range: string) {
  const {
    data: stats,
    error,
    refetch,
    fulfilledTimeStamp,
  } = useGetStatsQuery(
    { workspaceId: workspaceId!, range },
    { skip: !workspaceId, pollingInterval: POLL_MS }
  );

  // The spinner should only turn during an explicit refresh — a background poll
  // shouldn't make the UI look busy.
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch().unwrap();
    } catch {
      /* the error toast below already covers this */
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Polling means a persistent outage would otherwise toast on every tick.
  const notified = useRef(false);
  useEffect(() => {
    if (error && !notified.current) {
      notified.current = true;
      notify.error(errMessage(error, "Could not load analytics."));
    }
    if (!error) notified.current = false;
  }, [error]);

  return {
    stats: stats ?? null,
    refresh,
    refreshing,
    lastUpdated: fulfilledTimeStamp ? new Date(fulfilledTimeStamp) : null,
  };
}
