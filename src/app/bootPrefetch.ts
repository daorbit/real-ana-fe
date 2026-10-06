import { api } from "@/app/store/api";
import type { AppDispatch } from "@/app/store";
import { getToken, isDemoToken } from "@/shared/lib/http";
import { ACTIVE_WORKSPACE_KEY } from "@/features/workspace/context";
import { savedScope } from "@/features/analytics/hooks/useSiteScope";

const HOME_PATHS = new Set(["/", "/app", "/app/"]);

function rememberedWorkspace(): string | null {
  try {
    return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  } catch {
    return null;
  }
}

export function prefetchBootData({ dispatch }: { dispatch: AppDispatch }): void {
  if (!getToken() || isDemoToken()) return;
  const { pathname } = window.location;
  if (pathname !== "/" && !pathname.startsWith("/app")) return;

  dispatch(api.util.prefetch("getWorkspaces", undefined, {}));
  dispatch(api.util.prefetch("getNotificationCount", undefined, {}));

  const workspaceId = rememberedWorkspace();
  if (!workspaceId) return;

  dispatch(api.util.prefetch("getWorkspaceTheme", workspaceId, {}));
  if (!HOME_PATHS.has(pathname)) return;

  const sites = savedScope(workspaceId);
  dispatch(api.util.prefetch("getStats", { workspaceId, range: "24h", sites }, {}));
  dispatch(api.util.prefetch("getLive", { workspaceId, sites }, {}));
  dispatch(api.util.prefetch("getLayout", workspaceId, {}));
  dispatch(api.util.prefetch("getSites", workspaceId, {}));
}
