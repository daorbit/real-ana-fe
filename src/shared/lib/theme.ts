/**
 * Runtime theme: mode (light/dark/system), accent preset, and background
 * style. Applied by writing CSS custom properties onto <html> and a data
 * attribute Mantine already reads for color scheme, so no component needs
 * to know the theme system exists — everything already renders off
 * var(--accent) / var(--violet) / [data-mantine-color-scheme].
 */

export type ThemeMode = "system" | "light" | "dark";
export type BgStyle = "flat" | "aurora" | "meadow" | "grid";

export type AccentPreset = {
  id: string;
  label: string;
  /** Mid-tone hex; light/dark shades are derived from this. */
  hex: string;
};

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "blue", label: "Blue", hex: "#3b82f6" },
  { id: "forest", label: "Forest", hex: "#4f7563" },
  { id: "violet", label: "Violet", hex: "#7c3aed" },
  { id: "amber", label: "Amber", hex: "#ea580c" },
  { id: "cyan", label: "Cyan", hex: "#0891b2" },
  { id: "rose", label: "Rose", hex: "#e11d48" },
  { id: "slate", label: "Slate", hex: "#475569" },
  { id: "lime", label: "Lime", hex: "#65a30d" },
];

export const BG_STYLES: { id: BgStyle; label: string }[] = [
  { id: "flat", label: "Flat" },
  { id: "aurora", label: "Mesh — Aurora" },
  { id: "meadow", label: "Mesh — Meadow" },
  { id: "grid", label: "Dot grid" },
];

const STORAGE_KEY = "quantalog.theme";

type ThemePrefs = {
  mode: ThemeMode;
  accent: string; // preset id
  bg: BgStyle;
};

const DEFAULT_PREFS: ThemePrefs = { mode: "system", accent: "blue", bg: "flat" };

export function readThemePrefs(): ThemePrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      mode: parsed.mode ?? DEFAULT_PREFS.mode,
      accent: parsed.accent ?? DEFAULT_PREFS.accent,
      bg: parsed.bg ?? DEFAULT_PREFS.bg,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveThemePrefs(prefs: ThemePrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

/** #rrggbb -> {r,g,b} */
function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
/** Mixes a hex color toward white (amount > 0) or black (amount < 0). */
function shade(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  return rgbToHex(r + (target - r) * t, g + (target - g) * t, b + (target - b) * t);
}

/**
 * A 10-step Mantine-shaped scale (0 = near-white tint, 9 = near-black shade)
 * built from one mid-tone hex, so a single preset color drives every place
 * Mantine itself paints — buttons, badges, filled icons, focus rings.
 */
function buildScale(hex: string): string[] {
  return [
    shade(hex, 0.92), shade(hex, 0.8), shade(hex, 0.64), shade(hex, 0.44), shade(hex, 0.22),
    hex,
    shade(hex, -0.14), shade(hex, -0.3), shade(hex, -0.46), shade(hex, -0.6),
  ];
}

/**
 * Applies mode + accent + background to the document root. Call once on
 * boot and again whenever a preference changes — cheap enough to run on
 * every change without debouncing.
 */
export function applyTheme(prefs: ThemePrefs) {
  const root = document.documentElement;

  if (prefs.mode === "system") {
    root.removeAttribute("data-theme-mode");
  } else {
    root.setAttribute("data-theme-mode", prefs.mode);
  }

  const preset = ACCENT_PRESETS.find((p) => p.id === prefs.accent) ?? ACCENT_PRESETS[0];
  const dark = prefs.mode === "dark" ||
    (prefs.mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // A deeper shade in dark mode so filled surfaces don't glare neon; a
  // slightly lighter one in light mode for hover states.
  const accent = dark ? shade(preset.hex, -0.12) : preset.hex;
  const accent2 = dark ? shade(preset.hex, 0.1) : shade(preset.hex, -0.15);
  const accentSoft = dark
    ? `color-mix(in srgb, ${preset.hex} 18%, transparent)`
    : `color-mix(in srgb, ${preset.hex} 10%, transparent)`;

  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-2", accent2);
  root.style.setProperty("--accent-soft", accentSoft);
  // Legacy var names kept — most of the app's CSS still reads --violet-*.
  root.style.setProperty("--violet", accent);
  root.style.setProperty("--violet-2", accent2);
  root.style.setProperty("--violet-soft", accentSoft);

  // Mantine's own components (Button, Badge, ThemeIcon, focus rings, every
  // color="emerald" call site) resolve colour through these CSS vars, not
  // through the custom --accent ones above.
  const scale = buildScale(preset.hex);
  scale.forEach((c, i) => {
    root.style.setProperty(`--mantine-color-emerald-${i}`, c);
  });
  // primaryShade is { light: 6, dark: 7 } in theme.ts.
  const primaryShadeIdx = dark ? 7 : 6;
  const filled = scale[primaryShadeIdx];
  const filledHover = scale[Math.min(primaryShadeIdx + 1, 9)];
  // Mantine bakes -light / -light-hover / -text as literal computed colours
  // at theme-build time (see get-css-color-variables.mjs) rather than as var()
  // references to the numbered scale, so overwriting emerald-0..9 above does
  // NOT reach them — every "light" variant button/badge stayed green until
  // these are set explicitly too. Same family of vars, set for both the
  // named "emerald" colour and the "primary" alias Mantine also exposes, so
  // every call site — color="emerald" and unset/primary — repaints.
  for (const name of ["emerald", "primary"]) {
    root.style.setProperty(`--mantine-color-${name}-filled`, filled);
    root.style.setProperty(`--mantine-color-${name}-filled-hover`, filledHover);
    root.style.setProperty(`--mantine-color-${name}-light`, accentSoft);
    root.style.setProperty(`--mantine-color-${name}-light-hover`, accentSoft);
    root.style.setProperty(`--mantine-color-${name}-light-color`, scale[dark ? 4 : 6]);
    root.style.setProperty(`--mantine-color-${name}-text`, dark ? scale[4] : filled);
    root.style.setProperty(`--mantine-color-${name}-outline`, filled);
    root.style.setProperty(`--mantine-color-${name}-outline-hover`, accentSoft);
  }
  for (let i = 0; i < 10; i++) {
    root.style.setProperty(`--mantine-primary-color-${i}`, scale[i]);
  }

  root.setAttribute("data-bg-style", prefs.bg);
}

export function loadAndApplyTheme(): ThemePrefs {
  const prefs = readThemePrefs();
  applyTheme(prefs);
  return prefs;
}

export type { ThemePrefs };
