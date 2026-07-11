import { useCallback, useRef, useState } from "react";
import { api } from "../api";
import { notify, errMessage } from "../notify";
import { usePolling } from "./usePolling";
import type { Stats } from "../types";

/**
 * Aggregated analytics for a workspace, polled once a minute.
 *
 * Because it polls, a persistent outage would otherwise fire a toast every
 * tick — so only the first failure in a run of failures is surfaced.
 */
export function useStats(workspaceId: string | undefined, range: string) {
  const [stats, setStats] = useState<Stats | null>(null);
  const failed = useRef(false);

  const load = useCallback(async () => {
    if (!workspaceId) {
      setStats(null);
      return;
    }
    try {
      setStats(await api.get<Stats>(`/api/workspaces/${workspaceId}/stats?range=${range}`));
      failed.current = false;
    } catch (e) {
      if (!failed.current) {
        failed.current = true;
        notify.error(errMessage(e, "Could not load analytics."));
      }
    }
  }, [workspaceId, range]);

  const { refresh, refreshing, lastUpdated } = usePolling(load, [workspaceId, range]);

  return { stats, refresh, refreshing, lastUpdated };
}
