import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useGetWorkspacesQuery } from "./store";
import type { Workspace } from "./types";

const ACTIVE_KEY = "rta_active_ws";

type WsState = {
  workspaces: Workspace[];
  active: Workspace | null;
  loading: boolean;
  setActive: (id: string) => void;
  refresh: () => Promise<unknown>;
};

const Ctx = createContext<WsState | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  // Cached by RTK Query — the list is fetched once and reused across pages.
  const { data, isLoading, refetch } = useGetWorkspacesQuery();
  const workspaces = data ?? [];

  const [activeId, setActiveId] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_KEY)
  );

  // Keep the stored choice if it still exists, otherwise fall back to the first.
  useEffect(() => {
    if (!workspaces.length) return;
    setActiveId((cur) =>
      cur && workspaces.some((w) => w._id === cur) ? cur : workspaces[0]._id
    );
  }, [workspaces]);

  useEffect(() => {
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
  }, [activeId]);

  const setActive = useCallback((id: string) => setActiveId(id), []);
  const refresh = useCallback(() => refetch(), [refetch]);

  const active = workspaces.find((w) => w._id === activeId) ?? null;

  return (
    <Ctx.Provider value={{ workspaces, active, loading: isLoading, setActive, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWorkspace(): WsState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace outside provider");
  return ctx;
}
