import { useCallback, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetBioPagesQuery } from "@/features/bio/api";
import { useDemo } from "@/features/demo/context";
import { demoBioPages } from "@/features/demo/demoBio";
import type { BioPage } from "@/features/bio/types";

const EMPTY: BioPage[] = [];

export function useBioPages(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const query = useGetBioPagesQuery(workspaceId && !demo ? workspaceId : skipToken);
  const sample = useMemo(() => (demo ? demoBioPages() : null), [demo]);
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
    pages: data?.pages ?? EMPTY,
    statsDays: data?.statsDays ?? 30,
    loading: !sample && query.isLoading,
    failed: !sample && query.isError && !query.currentData,
    refresh,
    refreshing,
    lastUpdated: query.fulfilledTimeStamp ? new Date(query.fulfilledTimeStamp) : null,
  };
}
