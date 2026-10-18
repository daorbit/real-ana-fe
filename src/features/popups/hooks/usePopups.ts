import { useCallback, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetPopupsQuery } from "@/features/popups/api";
import { useDemo } from "@/features/demo/context";
import { demoPopups } from "@/features/demo/demoPopups";
import type { Popup } from "@/features/popups/types";

const EMPTY: Popup[] = [];

export function usePopups(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const query = useGetPopupsQuery(workspaceId && !demo ? workspaceId : skipToken);
  const sample = useMemo(() => (demo ? demoPopups() : null), [demo]);
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

  const data = sample ?? query.currentData;
  return {
    popups: data?.popups ?? EMPTY,
    statsDays: data?.statsDays ?? 30,
    loading: !sample && query.isLoading,
    failed: !sample && query.isError && !query.currentData,
    refresh,
    refreshing,
    lastUpdated: query.fulfilledTimeStamp ? new Date(query.fulfilledTimeStamp) : null,
  };
}
