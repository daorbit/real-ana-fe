import { useSites } from "@/features/workspace";
import { useStats, useLive, useSiteScope } from "@/features/analytics";
import { rangeLong } from "@/features/dashboards/types";
import type { DashboardRange } from "@/features/dashboards/types";

export function useDashboardData(workspaceId: string | undefined, range: DashboardRange) {
  const [siteScope, setSiteScope] = useSiteScope(workspaceId);
  const { stats, refresh, refreshing, refetching, lastUpdated } = useStats(workspaceId, range, undefined, siteScope);
  const { live, livePages, liveCountries } = useLive(workspaceId, undefined, siteScope);
  const { sites } = useSites(workspaceId);

  const widgetData = {
    stats,
    live,
    livePages,
    liveCountries,
    sites,
    siteScope,
    workspaceId,
    trafficTitle: `Traffic — ${rangeLong(range)}`,
    range,
  };

  return { widgetData, sites, siteScope, setSiteScope, refresh, refreshing, refetching, lastUpdated };
}
