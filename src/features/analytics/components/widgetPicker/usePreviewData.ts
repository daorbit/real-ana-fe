import { useMemo } from "react";
import { demoSites } from "@/features/demo/demoData";
import { demoLive, demoStats } from "@/features/demo/demoStats";
import type { WidgetData } from "@/features/analytics/components/widgets/WidgetRenderer";

export function usePreviewData(workspaceId: string | undefined): WidgetData {
  return useMemo(() => {
    const live = demoLive();
    return {
      stats: demoStats("24h"),
      live: live.live,
      livePages: live.livePages,
      liveCountries: live.liveCountries,
      sites: demoSites,
      siteScope: [],
      workspaceId,
      range: "24h",
      filterLinks: false,
    };
  }, [workspaceId]);
}
