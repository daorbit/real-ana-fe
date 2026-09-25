import { ACCENT_PRESETS, BG_STYLES, readThemePrefs } from "@/shared/lib/theme";

export const LEAD_FORMS_BASE =
  import.meta.env.VITE_LEAD_FORMS_URL ?? "https://forms.daorbit.in";

/**
 * @param workspaceToken Proof the session may act for the workspace, carried in
 *   the boot URL so the forms app's first request already holds one. Asking for
 *   it over postMessage instead means that request is refused and repeated, and
 *   the frame's first screen is a round trip slower than it needs to be.
 */
export function leadFormsUrl(
  path: string,
  currentMode?: "light" | "dark",
  workspaceToken?: string,
): string {
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
  // A textured background (gradient, mesh, grid, stars) is painted on the
  // panel behind the frame; this tells the forms app to leave its own page
  // ground transparent so that background shows through.
  const bgPreset = BG_STYLES.find((b) => b.id === prefs.bg);
  if (bgPreset && bgPreset.kind !== "flat") params.set("bg", "textured");
  // `wt` is the name the forms app boots from and its server accepts on the
  // initial navigation, where no header can be set.
  if (workspaceToken) params.set("wt", workspaceToken);

  return `${LEAD_FORMS_BASE}${path}?${params.toString()}`;
}
