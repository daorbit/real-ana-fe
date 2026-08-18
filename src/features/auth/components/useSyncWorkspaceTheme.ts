import { useEffect } from "react";
import { useGetWorkspaceThemeQuery } from "@/app/store";
import { applyTheme, saveThemePrefs, readThemePrefs, withThemeTransition } from "@/shared/lib/theme";
import type { ThemePrefs } from "@/shared/lib/theme";


const appliedFor = new Map<string, boolean>();

export function useSyncWorkspaceTheme(workspaceId: string | undefined) {
  const { data, isSuccess } = useGetWorkspaceThemeQuery(workspaceId ?? "", {
    skip: !workspaceId,
  });

  useEffect(() => {
    if (!workspaceId || !isSuccess) return;
    if (appliedFor.has(workspaceId)) return;
    appliedFor.set(workspaceId, true);

    if (!data?.theme) return; // Never saved server-side — keep localStorage.

    const merged: ThemePrefs = { ...readThemePrefs(), ...(data.theme as Partial<ThemePrefs>) };
    saveThemePrefs(merged);
    withThemeTransition(() => applyTheme(merged));
  }, [workspaceId, isSuccess, data]);
}
