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
export function useStats(
  workspaceId: string | undefined,
  range: string,
  filter?: string,
  sites?: string[],
  from?: string,
  to?: string
) {
  const {
    data: stats,
    error,
    refetch,
    fulfilledTimeStamp,
    isFetching,
  } = useGetStatsQuery(
    { workspaceId: workspaceId!, range, filter, sites, from, to },
    { skip: !workspaceId, pollingInterval: POLL_MS }
  );

  /**
   * Two distinct busy states:
   *
   * - `loading`  — the very first fetch, when there is no prior payload to show
   *   at all. Only this should dim the page and block interaction.
   * - `refetching` — any fetch while some data is already on screen: a range
   *   switch, a filter change, or a background poll. The old numbers stay
   *   visible and readable; a small inline spinner is enough.
   *
   * `stats` is RTK Query's `data`, which holds the last settled payload across
   * cache-key changes. `currentData` was used before, but it goes undefined on
   * *every* key change — including each filter click — so it made the whole
   * page flash busy on any filter.
   */
  const hasData = stats !== undefined;
  const loading = isFetching && !hasData;
  const refetching = isFetching && hasData;

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
    loading,
    refetching,
    refresh,
    refreshing,
    lastUpdated: fulfilledTimeStamp ? new Date(fulfilledTimeStamp) : null,
  };
}
