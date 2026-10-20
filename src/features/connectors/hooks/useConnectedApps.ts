import { useCallback, useEffect, useState } from "react";
import { connectorApi, type ConnectedApp } from "@/features/connectors/lib/connectorApi";
import { useRefetchOnFocus } from "@/shared/hooks/useRefetchOnFocus";
import type { ApiError } from "@/shared/lib/http";
import { errMessage, notify } from "@/shared/lib/notify";

const FOCUS_REFRESH_MS = 10_000;

export function useConnectedApps(enabled = true) {
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [mcpUrl, setMcpUrl] = useState("");
  const [loading, setLoading] = useState(enabled);
  const [loadedAt, setLoadedAt] = useState<number>();
  const [available, setAvailable] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await connectorApi.listApps();
      setApps(result.items);
      setMcpUrl(result.mcpUrl);
    } catch (err) {
      if ((err as ApiError).status === 404) setAvailable(false);
      else if (!silent) notify.error(errMessage(err, "Could not load your connected AI apps."));
    } finally {
      setLoadedAt(Date.now());
      if (!silent) setLoading(false);
    }
  }, []);

  const refreshSilently = useCallback(() => load(true), [load]);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  useRefetchOnFocus(refreshSilently, loadedAt, FOCUS_REFRESH_MS, enabled && available);

  const revoke = async (id: string) => {
    setRevokingId(id);
    try {
      await connectorApi.revokeApp(id);
      setApps((prev) => prev.filter((app) => app.id !== id));
      notify.success("Disconnected. That app can no longer read your workspace.");
    } catch (err) {
      notify.error(errMessage(err, "Could not disconnect that app."));
    } finally {
      setRevokingId(null);
    }
  };

  return { apps, mcpUrl, loading, available, revokingId, revoke, reload: () => load() };
}
