import { useEffect } from "react";

const PREFIX = "quantalog_has_dashboards";

function read(workspaceId: string | undefined): boolean {
  if (!workspaceId) return false;
  try {
    return localStorage.getItem(`${PREFIX}:${workspaceId}`) === "1";
  } catch {
    return false;
  }
}

export function useHasDashboardsHint(workspaceId: string | undefined, loaded: boolean, hasAny: boolean) {
  useEffect(() => {
    if (!workspaceId || !loaded) return;
    try {
      localStorage.setItem(`${PREFIX}:${workspaceId}`, hasAny ? "1" : "0");
    } catch {
      return;
    }
  }, [workspaceId, loaded, hasAny]);

  return read(workspaceId);
}
