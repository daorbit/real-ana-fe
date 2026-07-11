import { useCallback, useState } from "react";
import { api } from "../api";
import { usePolling } from "./usePolling";
import type { Site } from "../types";

/** The sites belonging to a workspace, polled once a minute. */
export function useSites(workspaceId: string | undefined) {
  const [sites, setSites] = useState<Site[]>([]);

  const load = useCallback(async () => {
    if (!workspaceId) {
      setSites([]);
      return;
    }
    try {
      setSites(await api.get<Site[]>(`/api/workspaces/${workspaceId}/sites`));
    } catch {
      setSites([]);
    }
  }, [workspaceId]);

  const { refresh, refreshing, lastUpdated } = usePolling(load, [workspaceId]);

  return { sites, reload: load, refresh, refreshing, lastUpdated };
}
