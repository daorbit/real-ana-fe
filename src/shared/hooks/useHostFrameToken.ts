import { useEffect } from "react";
import { api } from "@/shared/lib/http";

type TokenResponse = { token: string };

export function useHostFrameToken(
  workspaceId: string | null | undefined,
  tokenPath: string,
  frameBase: string,
): void {
  useEffect(() => {
    if (!workspaceId || !frameBase) return;
    const frameOrigin = new URL(frameBase).origin;
    const mint = () =>
      api
        .post<TokenResponse>(`/api/workspaces/${workspaceId}/${tokenPath}`, {})
        .then((res) => res.token, () => "");

    let prefetched: Promise<string> | null = mint();

    function onMessage(event: MessageEvent) {
      if (event.origin !== frameOrigin) return;
      if (event.data?.type !== "quantalog:workspace-token-request") return;
      const frame = event.source as Window | null;
      if (!frame) return;
      const pending = prefetched ?? mint();
      prefetched = null;
      void pending.then((token) => {
        frame.postMessage({ type: "quantalog:workspace-token", token }, frameOrigin);
      });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [workspaceId, tokenPath, frameBase]);
}
