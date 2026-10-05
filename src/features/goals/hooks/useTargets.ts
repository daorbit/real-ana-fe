import { useCallback, useMemo, useState } from "react";
import { useGetTargetsQuery } from "@/features/goals/api";
import { useCelebrateTargets } from "@/features/goals/hooks/useCelebrateTargets";
import { useDemo } from "@/features/demo/context";
import { demoTargets } from "@/features/demo/demoDashboards";
import { POLL_MS } from "@/shared/hooks/usePolling";

export function useTargets(workspaceId: string | undefined) {
  const { data, isLoading, refetch, fulfilledTimeStamp } = useGetTargetsQuery(workspaceId ?? "", {
    skip: !workspaceId,
    pollingInterval: POLL_MS,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
  });

  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch().unwrap();
    } catch {
      return;
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  useCelebrateTargets(data);

  const { demo } = useDemo();
  const sample = useMemo(() => (demo ? demoTargets() : null), [demo]);

  if (sample) {
    return {
      targets: sample,
      loading: false,
      refresh,
      refreshing: false,
      lastUpdated: null,
    };
  }

  return {
    targets: data ?? [],
    loading: isLoading,
    refresh,
    refreshing,
    lastUpdated: fulfilledTimeStamp ? new Date(fulfilledTimeStamp) : null,
  };
}
