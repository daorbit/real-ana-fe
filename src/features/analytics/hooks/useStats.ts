import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetStatsQuery } from "@/app/store";
import { notifyError } from "@/shared/lib/notify";
import { useDemo } from "@/features/demo/context";
import { demoStats } from "@/features/demo/demoStats";
import { POLL_MS } from "@/shared/hooks/usePolling";
import { useRefetchOnFocus } from "@/shared/hooks/useRefetchOnFocus";
import type { CompareMode } from "@/shared/types";

const STATS_FOCUS_STALE_MS = 30_000;

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
    {
      skip: !workspaceId,
      pollingInterval: POLL_MS,
      // Stats are the heaviest query in the app. A backgrounded tab asking for
      // them every cycle is load the server carries for a dashboard nobody is
      // looking at; the focus refetch catches it up on return.
      skipPollingIfUnfocused: true,
    }
  );

  useRefetchOnFocus(refetch, fulfilledTimeStamp, STATS_FOCUS_STALE_MS, Boolean(workspaceId));


  const staleIsSameWorkspace = originalArgs?.workspaceId === workspaceId;
  const stats = currentData ?? (staleIsSameWorkspace ? settled : undefined);


  const hasData = stats !== undefined;
  const loading = isFetching && !hasData;
  const refetching = isFetching && hasData;
  const switching = isFetching && currentData === undefined;
  const failed = Boolean(error) && !isFetching && currentData === undefined;

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

  const { demo } = useDemo();
  const sample = useMemo(() => (demo ? demoStats(range) : null), [demo, range]);

  if (sample) {
    return {
      stats: sample,
      loading: false,
      refetching: false,
      switching: false,
      failed: false,
      refresh,
      refreshing: false,
      lastUpdated: null,
    };
  }

  return {
    stats: stats ?? null,
    loading,
    refetching,
    switching,
    failed,
    refresh,
    refreshing,
    lastUpdated: fulfilledTimeStamp ? new Date(fulfilledTimeStamp) : null,
  };
}
