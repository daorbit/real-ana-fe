import { useCallback, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetAlertsQuery } from "@/features/alerts/api";
import { useDemo } from "@/features/demo/context";
import { demoAlerts } from "@/features/demo/demoAlerts";

export function useAlerts(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const query = useGetAlertsQuery(workspaceId && !demo ? workspaceId : skipToken);
  const sample = useMemo(() => (demo ? demoAlerts() : null), [demo]);
  const [refreshing, setRefreshing] = useState(false);
  const { refetch } = query;

  const refresh = useCallback(async () => {
    if (demo) return;
    setRefreshing(true);
    try {
      await refetch().unwrap();
    } catch {
      return;
    } finally {
      setRefreshing(false);
    }
  }, [demo, refetch]);

  return {
    overview: sample ?? query.currentData ?? null,
    loading: !sample && query.isLoading,
    failed: !sample && query.isError && !query.currentData,
    refresh,
    refreshing,
    lastUpdated: query.fulfilledTimeStamp ? new Date(query.fulfilledTimeStamp) : null,
  };
}
