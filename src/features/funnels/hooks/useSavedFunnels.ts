import { useGetFunnelsQuery } from "@/app/store";
import type { SavedFunnel } from "@/shared/types";

const NONE: SavedFunnel[] = [];

export function useSavedFunnels(workspaceId: string | undefined, enabled: boolean) {
  const { data, isLoading, isError } = useGetFunnelsQuery(workspaceId!, { skip: !workspaceId || !enabled });
  return { saved: data ?? NONE, loading: isLoading, failed: isError };
}

export function useSavedFunnel(workspaceId: string | undefined, funnelId: string | undefined, enabled: boolean) {
  const { saved, loading, failed } = useSavedFunnels(workspaceId, enabled);
  const funnel = funnelId ? (saved.find((f) => f.id === funnelId) ?? null) : null;
  return { funnel, loading, missing: !loading && !failed && Boolean(funnelId) && funnel === null };
}
