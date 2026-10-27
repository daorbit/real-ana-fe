import { useEffect, useState } from "react";
import { api } from "@/shared/lib/http";

type TokenResponse = { token: string };

export function useHostFrameToken(
  workspaceId: string | null | undefined,
  tokenPath: string,
  frameBase: string,
): string | undefined {
  const [bootToken, setBootToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    setBootToken(undefined);
    api
      .post<TokenResponse>(`/api/workspaces/${workspaceId}/${tokenPath}`, {})
      .then((res) => {
        if (!cancelled) setBootToken(res.token);
      })
      .catch(() => {
        if (!cancelled) setBootToken("");
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, tokenPath]);

  useEffect(() => {
    if (!workspaceId) return;
    function onMessage(event: MessageEvent) {
      if (event.data?.type !== "quantalog:workspace-token-request") return;
      const frame = event.source as Window | null;
      if (!frame) return;
      api
        .post<TokenResponse>(`/api/workspaces/${workspaceId}/${tokenPath}`, {})
        .then((res) => {
          frame.postMessage({ type: "quantalog:workspace-token", token: res.token }, frameBase);
        })
        .catch(() => {
          frame.postMessage({ type: "quantalog:workspace-token", token: "" }, frameBase);
        });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [workspaceId, tokenPath, frameBase]);

  return bootToken;
}
