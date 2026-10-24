import { useMemo } from "react";
import { useSiteScope } from "@/features/analytics/hooks/useSiteScope";
import { useSites } from "@/features/workspace";

const EMPTY: string[] = [];

export function useFunnelSites(workspaceId: string | undefined): string[] {
  const [picked] = useSiteScope(workspaceId);
  const { sites } = useSites(workspaceId);

  return useMemo(() => {
    if (!picked.length) return EMPTY;
    const owned = new Set(sites.map((s) => s.siteId));
    return picked.filter((id) => owned.has(id));
  }, [picked, sites]);
}
