import { useCallback, useEffect, useState } from "react";
import { api } from "@/shared/lib/http";
import { notify, errMessage } from "@/shared/lib/notify";

export type Session = {
  id: string;
  current: boolean;
  browser: string;
  os: string;
  device: string;
  location: string;
  lastSeenAt: string;
  createdAt: string;
};

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSessions(await api.get<Session[]>("/api/auth/sessions"));
    } catch (err) {
      notify.error(errMessage(err, "Could not load your sessions."));
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
      await api.post(`/api/auth/sessions/${id}/revoke`, {});
      setSessions((prev) => prev.filter((s) => s.id !== id));
      notify.success("That session has been signed out.");
    } catch (err) {
      notify.error(errMessage(err, "Could not sign out that session."));
    } finally {
      setRevokingId(null);
    }
  };

  const revokeOthers = async () => {
    setRevokingOthers(true);
    try {
      await api.post("/api/auth/sessions/revoke-others", {});
      setSessions((prev) => prev.filter((s) => s.current));
      notify.success("Signed out of all other sessions.");
    } catch (err) {
      notify.error(errMessage(err, "Could not sign out other sessions."));
    } finally {
      setRevokingOthers(false);
    }
  };

  return { sessions, loading, revokingId, revokingOthers, revoke, revokeOthers };
}
