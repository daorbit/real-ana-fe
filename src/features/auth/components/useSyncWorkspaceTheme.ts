import { useEffect } from "react";
import { useGetWorkspaceThemeQuery } from "@/app/store";
import { applyTheme, saveThemePrefs, readThemePrefs, withThemeTransition } from "@/shared/lib/theme";
import type { ThemePrefs } from "@/shared/lib/theme";

export function useSyncWorkspaceTheme(workspaceId: string | undefined) {
  const { data, isSuccess } = useGetWorkspaceThemeQuery(workspaceId ?? "", {
    skip: !workspaceId,
  });

  useEffect(() => {
    if (!workspaceId || !isSuccess) return;
    if (!data?.theme) return; // Never saved server-side — keep localStorage.

    const merged: ThemePrefs = { ...readThemePrefs(), ...(data.theme as Partial<ThemePrefs>) };
    saveThemePrefs(merged);
    withThemeTransition(() => applyTheme(merged));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, isSuccess, data?.theme]);
}
