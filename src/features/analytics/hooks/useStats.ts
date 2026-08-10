import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetStatsQuery } from "@/app/store";
import { notifyError } from "@/shared/lib/notify";
import { useDemo } from "@/features/demo/context";
import { demoStats } from "@/features/demo/demoStats";
import { POLL_MS } from "@/shared/hooks/usePolling";
import type { CompareMode } from "@/shared/types";

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
  to?: string,
  compare?: CompareMode,
  compareFrom?: string,
  compareTo?: string
) {
  const {
    data: settled,
    currentData,
    error,
    refetch,
    fulfilledTimeStamp,
    isFetching,
    originalArgs,
  } = useGetStatsQuery(
    { workspaceId: workspaceId!, range, filter, sites, from, to, compare, compareFrom, compareTo },
    { skip: !workspaceId, pollingInterval: POLL_MS }
  );

  /**
   * Hold the previous payload while a new one loads — but never across a
   * workspace switch.
   *
   * `data` keeps the last settled result even when the cache key changes, which
   * is what stops a filter or range click from blanking the page. Across
   * workspaces that same behaviour is a bug with teeth: it leaves one tenant's
   * numbers on screen under another tenant's name until the fetch lands, which
   * reads as "this workspace has that traffic".
   *
   * So: fall back to the stale payload only while it belongs to the workspace
   * being asked about. `currentData` is undefined during any in-flight key
   * change, and `originalArgs` says which workspace the settled payload is
   * actually for.
   */
  const staleIsSameWorkspace = originalArgs?.workspaceId === workspaceId;
  const stats = currentData ?? (staleIsSameWorkspace ? settled : undefined);

  /**
   * Two distinct busy states:
   *
   * - `loading`  — the very first fetch, when there is no prior payload to show
   *   at all. Only this should dim the page and block interaction.
   * - `refetching` — any fetch while some data is already on screen: a range
   *   switch, a filter change, or a background poll. The old numbers stay
   *   visible and readable; a small inline spinner is enough.
   *
   * `stats` is the last settled payload *for this workspace* — see above. It
   * survives filter and range changes, so those don't flash the page busy, but
   * goes undefined the moment the workspace changes, so a switch shows a load
   * rather than the previous tenant's numbers.
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
      notifyError(error, "Could not load analytics.");
    }
    if (!error) notified.current = false;
  }, [error]);

  /**
   * Demo mode substitutes a generated payload for the real one.
   *
   * The swap happens here, at the single point both Home and Analytics read
   * stats from, so every widget switches together and no page needs to know
   * demo mode exists. The real query keeps running underneath — turning demo
   * off shows live numbers immediately rather than refetching.
   */
  const { demo } = useDemo();
  const sample = useMemo(() => (demo ? demoStats(range) : null), [demo, range]);

  if (sample) {
    return {
      stats: sample,
      loading: false,
      refetching: false,
      refresh,
      refreshing: false,
      lastUpdated: null,
    };
  }

  return {
    stats: stats ?? null,
    loading,
    refetching,
    refresh,
    refreshing,
    lastUpdated: fulfilledTimeStamp ? new Date(fulfilledTimeStamp) : null,
  };
}
