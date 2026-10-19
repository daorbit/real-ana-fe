import { useCallback, useEffect, useState } from "react";
import { connectorApi, type ConnectedApp } from "@/features/connectors/lib/connectorApi";
import type { ApiError } from "@/shared/lib/http";
import { errMessage, notify } from "@/shared/lib/notify";

export function useConnectedApps() {
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setApps((await connectorApi.listApps()).items);
    } catch (err) {
      if ((err as ApiError).status === 404) setAvailable(false);
      else notify.error(errMessage(err, "Could not load your connected AI apps."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  return { apps, loading, available, revokingId, revoke };
}
