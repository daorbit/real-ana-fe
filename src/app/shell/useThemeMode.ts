import { useEffect, useState } from "react";
import { useMantineColorScheme } from "@mantine/core";
import { applyTheme, readThemePrefs, saveThemePrefs, withThemeTransition } from "@/shared/lib/theme";
import type { ThemeMode } from "@/shared/lib/theme";

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>(() => readThemePrefs().mode);
  const { setColorScheme } = useMantineColorScheme();

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
  };

  return { mode, setMode };
}
