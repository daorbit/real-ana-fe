import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useGetWorkspacesQuery } from "./store";
import type { Workspace, QuotaSummary } from "./types";

const ACTIVE_KEY = "rta_active_ws";

/** A stable empty array — `data ?? []` would mint a new reference on every
 *  render while `data` is undefined, which is a dependency-array trap: the
 *  effect below depends on `workspaces`, so a fresh `[]` every render meant
 *  it never stopped firing (setState -> render -> new [] -> effect -> setState -> ...). */
const EMPTY: Workspace[] = [];

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
  const workspaces = data ?? EMPTY;

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

/**
 * The plan and quota of the workspace currently being viewed.
 *
 * Plans are per workspace, so "what am I on" only has an answer relative to
 * one — every gate in the app (date ranges, WhatsApp delivery, the rail's plan
 * card) asks about the active workspace, not the account.
 *
 * Null while the list is loading, and for a workspace with no plan row. Callers
 * treat null as "don't block": a transient loading gap must not lock someone
 * out of a feature they pay for, and the server enforces every one of these
 * limits again anyway.
 */
export function useActiveBilling(): QuotaSummary {
  const { active } = useWorkspace();
  // Read straight off the workspace — the list already carries each one's plan,
  // so there is no second request and no way for the two to disagree.
  return active?.billing ?? null;
}
