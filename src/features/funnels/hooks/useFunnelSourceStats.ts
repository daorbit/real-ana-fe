import { useMemo } from "react";
import { useGetStatsQuery } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { demoStats } from "@/features/demo/demoStats";
import type { RangeState } from "@/features/analytics/components/RangePicker";

export function useFunnelSourceStats(
  workspaceId: string | undefined,
  range: RangeState,
  sites: string[],
  enabled: boolean,
) {
  const { demo } = useDemo();
  const { currentData, isFetching } = useGetStatsQuery(
    { workspaceId: workspaceId!, range: range.preset, sites, from: range.from, to: range.to },
    { skip: !workspaceId || !enabled || demo },
  );
  const sample = useMemo(() => (demo ? demoStats(range.preset) : null), [demo, range.preset]);

  return {
    stats: sample ?? currentData ?? null,
    loading: !sample && isFetching && !currentData,
  };
}
