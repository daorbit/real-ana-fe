import { useEffect, useState } from "react";
import { connectorApi, type AuthorizationRequest } from "@/features/connectors/lib/connectorApi";
import { errMessage, notify } from "@/shared/lib/notify";

type Decision = "approve" | "deny";

export function useAuthorizationRequest(requestId: string, enabled: boolean) {
  const [request, setRequest] = useState<AuthorizationRequest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [deciding, setDeciding] = useState<Decision | null>(null);

  useEffect(() => {
    if (!enabled || !requestId) return;
    let cancelled = false;
    setLoading(true);
    connectorApi
      .describe(requestId)
      .then((data) => {
        if (!cancelled) setRequest(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errMessage(err, "This connection request could not be loaded."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestId, enabled]);

  const decide = async (decision: Decision, workspaceId?: string) => {
    setDeciding(decision);
    try {
      const { redirectUrl } =
        decision === "approve" && workspaceId
          ? await connectorApi.approve(requestId, workspaceId)
          : await connectorApi.deny(requestId);
      window.location.assign(redirectUrl);
    } catch (err) {
      setDeciding(null);
      notify.error(errMessage(err, "Could not complete the connection. Start again from Claude."));
    }
  };

  return { request, loadError, loading, deciding, decide };
}
