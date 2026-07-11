import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { api } from "./api";
import type { Workspace } from "./types";

const ACTIVE_KEY = "rta_active_ws";

type WsState = {
  workspaces: Workspace[];
  active: Workspace | null;
  loading: boolean;
  setActive: (id: string) => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<WsState | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_KEY));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await api.get<Workspace[]>("/api/workspaces");
    setWorkspaces(list);
    setActiveId((cur) => {
      // keep current if still valid, else fall back to first (0th)
      if (cur && list.some((w) => w._id === cur)) return cur;
      return list[0]?._id ?? null;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
  }, [activeId]);

  const active = workspaces.find((w) => w._id === activeId) ?? null;

  return (
    <Ctx.Provider value={{ workspaces, active, loading, setActive: setActiveId, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWorkspace(): WsState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace outside provider");
  return ctx;
}
