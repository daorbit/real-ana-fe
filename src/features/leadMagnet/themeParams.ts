import { ACCENT_PRESETS, readThemePrefs } from "@/shared/lib/theme";

export const LEAD_FORMS_BASE =
  import.meta.env.VITE_LEAD_FORMS_URL ?? "https://da-forms-ochre.vercel.app";

 
export function leadFormsUrl(path: string): string {
  const prefs = readThemePrefs();

  const mode =
    prefs.mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : prefs.mode;

  const accent = ACCENT_PRESETS.find((preset) => preset.id === prefs.accent);

  const params = new URLSearchParams({
    mode,
    radius: prefs.radius,
    density: prefs.density,
    embedded: "1",
  });
  if (accent) params.set("accent", accent.hex);

  return `${LEAD_FORMS_BASE}${path}?${params.toString()}`;
}
