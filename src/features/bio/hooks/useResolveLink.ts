import { useCallback, useState } from "react";
import { useResolveBioLinkMutation } from "@/features/bio/api";
import { detectService } from "@/features/bio/lib/serviceCatalog";
import type { BioResolvedLink } from "@/features/bio/types";
import { useDemo } from "@/features/demo/context";

function offlineResolve(url: string): BioResolvedLink {
  return { service: detectService(url)?.id ?? "custom", url, title: "", artist: "", artworkUrl: "" };
}

export function useResolveLink(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const [resolveRemote] = useResolveBioLinkMutation();
  const [resolving, setResolving] = useState(false);

  const resolve = useCallback(
    async (url: string): Promise<BioResolvedLink> => {
      if (demo || !workspaceId) return offlineResolve(url);
      setResolving(true);
      try {
        return await resolveRemote({ workspaceId, url }).unwrap();
      } catch {
        return offlineResolve(url);
      } finally {
        setResolving(false);
      }
    },
    [demo, workspaceId, resolveRemote],
  );

  return { resolve, resolving };
}
