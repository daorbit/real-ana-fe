import { useCallback, useMemo, useState } from "react";
import { useGetTargetsQuery } from "@/features/goals/api";
import { useCelebrateTargets } from "@/features/goals/hooks/useCelebrateTargets";
import { useDemo } from "@/features/demo/context";
import { demoTargets } from "@/features/demo/demoDashboards";
import { POLL_MS } from "@/shared/hooks/usePolling";
import { useRefetchOnFocus } from "@/shared/hooks/useRefetchOnFocus";

const TARGETS_FOCUS_STALE_MS = 60_000;

export function useTargets(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const enabled = Boolean(workspaceId) && !demo;

  const { data, currentData, originalArgs, isLoading, refetch, fulfilledTimeStamp } = useGetTargetsQuery(
    workspaceId ?? "",
    {
      skip: !enabled,
      pollingInterval: POLL_MS,
      skipPollingIfUnfocused: true,
    },
  );

  useRefetchOnFocus(refetch, fulfilledTimeStamp, TARGETS_FOCUS_STALE_MS, enabled);

  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    if (!enabled) return;
    setRefreshing(true);
    try {
      await refetch().unwrap();
    } catch {
      return;
    } finally {
      setRefreshing(false);
    }
  }, [enabled, refetch]);

  const targets = currentData ?? (originalArgs === workspaceId ? data : undefined);
  useCelebrateTargets(targets);

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
    targets: targets ?? [],
    loading: isLoading,
    refresh,
    refreshing,
    lastUpdated: fulfilledTimeStamp ? new Date(fulfilledTimeStamp) : null,
  };
}
