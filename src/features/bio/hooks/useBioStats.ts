import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetBioPageStatsQuery } from "@/features/bio/api";
import { useDemo } from "@/features/demo/context";
import { demoBioStats } from "@/features/demo/demoBio";

export function useBioStats(workspaceId: string | undefined, pageId: string | undefined, days: number) {
  const { demo } = useDemo();
  const live = Boolean(workspaceId && pageId && !demo);
  const query = useGetBioPageStatsQuery(live ? { workspaceId: workspaceId!, id: pageId!, days } : skipToken);
  const sample = useMemo(() => (demo && pageId ? demoBioStats(pageId, days) : null), [demo, pageId, days]);

  return {
    stats: demo ? sample : query.currentData ?? null,
    loading: !demo && (query.isLoading || query.isFetching) && !query.currentData,
    fetching: !demo && query.isFetching,
    failed: !demo && query.isError && !query.currentData,
    retry: () => void query.refetch(),
  };
}
