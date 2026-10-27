import { BG_STYLES, FIXED_ACCENT, readThemePrefs } from "@/shared/lib/theme";

export function hostFrameUrl(
  base: string,
  path: string,
  currentMode?: "light" | "dark",
  workspaceToken?: string,
): string {
  const prefs = readThemePrefs();
  const documentMode = document.documentElement.getAttribute("data-mantine-color-scheme");
  const mode = currentMode ?? (prefs.mode === "system"
    ? (documentMode === "dark" || documentMode === "light"
        ? documentMode
        : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : prefs.mode);

  const params = new URLSearchParams({
    mode,
    radius: prefs.radius,
    density: prefs.density,
    font: prefs.fontSize,
    table: prefs.table,
    motion: prefs.motion ? "on" : "off",
    embedded: "1",
  });
  params.set("accent", FIXED_ACCENT[mode]);
  const bgPreset = BG_STYLES.find((b) => b.id === prefs.bg);
  if (bgPreset && bgPreset.kind !== "flat") params.set("bg", "textured");
  if (workspaceToken) params.set("wt", workspaceToken);

  return `${base}${path}?${params.toString()}`;
}
