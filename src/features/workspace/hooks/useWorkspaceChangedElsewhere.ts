import { useCallback, useEffect, useRef, useState } from "react";
import { useDemo } from "@/features/demo/context";
import { ACTIVE_WORKSPACE_KEY, useWorkspace } from "@/features/workspace/context";
import type { Workspace } from "@/shared/types";

export function useWorkspaceChangedElsewhere() {
  const { workspaces, active, setActive, refresh } = useWorkspace();
  const { demo } = useDemo();
  const [incomingId, setIncomingId] = useState<string | null>(null);
  const refreshedFor = useRef<string | null>(null);

  useEffect(() => {
    if (demo) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== ACTIVE_WORKSPACE_KEY) return;
      setIncomingId(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [demo]);

  const incoming: Workspace | null =
    incomingId && incomingId !== active?._id ? workspaces.find((w) => w._id === incomingId) ?? null : null;

  useEffect(() => {
    if (!incomingId || incomingId === active?._id || incoming || refreshedFor.current === incomingId) return;
    refreshedFor.current = incomingId;
    void refresh();
  }, [incomingId, active?._id, incoming, refresh]);

  const accept = useCallback(() => {
    if (incoming) setActive(incoming._id);
    setIncomingId(null);
  }, [incoming, setActive]);

  const dismiss = useCallback(() => setIncomingId(null), []);

  return { current: active, incoming, accept, dismiss };
}
