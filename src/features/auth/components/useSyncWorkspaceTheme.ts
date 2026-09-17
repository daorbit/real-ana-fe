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

    const current = readThemePrefs();
    const merged: ThemePrefs = { ...current, ...(data.theme as Partial<ThemePrefs>) };
    saveThemePrefs(merged);

    // The query result is a new object on every refetch (route change, cache
    // invalidation, ...) even when the theme itself hasn't changed — without
    // this check the pulse animation fired on ordinary navigation, not just
    // an actual workspace switch or theme edit.
    const changed = (Object.keys(merged) as (keyof ThemePrefs)[]).some(
      (key) => merged[key] !== current[key],
    );
    if (changed) withThemeTransition(() => applyTheme(merged));
    else applyTheme(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, isSuccess, data?.theme]);
}
