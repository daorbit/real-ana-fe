import { useEffect, useRef } from "react";
import { useGetWorkspaceThemeQuery } from "@/app/store";
import { applyTheme, saveThemePrefs, readThemePrefs, withThemeTransition } from "@/shared/lib/theme";
import type { ThemePrefs } from "@/shared/lib/theme";

/**
 * Pulls the active workspace's saved Appearance from the server and applies
 * it once per workspace, so switching workspaces (or opening one on a new
 * device) picks up the team's theme instead of staying on whatever this
 * browser had saved locally.
 *
 * localStorage remains the fast path for first paint (see main.tsx —
 * loadAndApplyTheme runs before this hook can possibly have fetched
 * anything), and stays the fallback for a workspace that has never saved a
 * theme (`theme: null`) or while offline. This hook only overrides it once
 * the server responds with something newer.
 */
export function useSyncWorkspaceTheme(workspaceId: string | undefined) {
  const { data, isSuccess } = useGetWorkspaceThemeQuery(workspaceId ?? "", {
    skip: !workspaceId,
  });

  // Only re-apply when the *workspace* changes, not on every refetch of the
  // same one — otherwise a background revalidation could stomp an edit the
  // user just made locally before the mutation's own cache update lands.
  const appliedFor = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!workspaceId || !isSuccess) return;
    if (appliedFor.current === workspaceId) return;
    appliedFor.current = workspaceId;

    if (!data?.theme) return; // Never saved server-side — keep localStorage.

    const merged: ThemePrefs = { ...readThemePrefs(), ...(data.theme as Partial<ThemePrefs>) };
    saveThemePrefs(merged);
    withThemeTransition(() => applyTheme(merged));
  }, [workspaceId, isSuccess, data]);
}
