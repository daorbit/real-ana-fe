import { ACCENT_PRESETS, readThemePrefs } from "@/shared/lib/theme";

export const LEAD_FORMS_BASE =
  import.meta.env.VITE_LEAD_FORMS_URL ?? "https://forms.daorbit.in";

export function leadFormsUrl(path: string, currentMode?: "light" | "dark"): string {
  const prefs = readThemePrefs();
  const accent = ACCENT_PRESETS.find((preset) => preset.id === prefs.accent);
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
    embedded: "1",
  });
  if (accent) params.set("accent", accent.hex);

  return `${LEAD_FORMS_BASE}${path}?${params.toString()}`;
}
