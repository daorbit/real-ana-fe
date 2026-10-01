import { useEffect, useState } from "react";
import { useMantineColorScheme } from "@mantine/core";
import { useSaveWorkspaceThemeMutation } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import { applyTheme, readThemePrefs, saveThemePrefs, withThemeTransition } from "@/shared/lib/theme";
import type { ThemeMode } from "@/shared/lib/theme";

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>(() => readThemePrefs().mode);
  const { setColorScheme } = useMantineColorScheme();
  const { active } = useWorkspace();
  const [saveWorkspaceTheme] = useSaveWorkspaceThemeMutation();

  useEffect(() => {
    const sync = () => setModeState(readThemePrefs().mode);
    window.addEventListener("quantalog-theme-change", sync);
    return () => window.removeEventListener("quantalog-theme-change", sync);
  }, []);

  const setMode = (next: ThemeMode) => {
    const prefs = { ...readThemePrefs(), mode: next };
    saveThemePrefs(prefs);
    setModeState(next);
    withThemeTransition(() => {
      applyTheme(prefs);
      setColorScheme(next === "system" ? "auto" : next);
    });
    if (active?._id) void saveWorkspaceTheme({ workspaceId: active._id, theme: prefs });
  };

  return { mode, setMode };
}
