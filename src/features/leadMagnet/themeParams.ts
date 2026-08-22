import { ACCENT_PRESETS, readThemePrefs } from "@/shared/lib/theme";

export const LEAD_FORMS_BASE =
  import.meta.env.VITE_LEAD_FORMS_URL ?? "https://da-forms-ochre.vercel.app";

export function leadFormsUrl(path: string): string {
  const prefs = readThemePrefs();
  const accent = ACCENT_PRESETS.find((preset) => preset.id === prefs.accent);

  const params = new URLSearchParams({
    // Hard-coded regardless of this app's own mode: the builder's canvas
    // renders the live form in the respondent's fixed light colours, so a dark
    // chrome around it reads as broken rather than as a dark editor.
    mode: "light",
    radius: prefs.radius,
    density: prefs.density,
    embedded: "1",
  });
  if (accent) params.set("accent", accent.hex);

  return `${LEAD_FORMS_BASE}${path}?${params.toString()}`;
}
