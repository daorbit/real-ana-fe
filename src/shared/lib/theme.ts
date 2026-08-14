/**
 * Runtime theme: mode (light/dark/system), accent preset, background style,
 * corner radius, and density. Applied by writing CSS custom properties onto
 * <html> and a data attribute Mantine already reads for color scheme, so no
 * component needs to know the theme system exists — everything already
 * renders off var(--accent) / var(--violet) / [data-mantine-color-scheme].
 */

export type ThemeMode = "system" | "light" | "dark";
export type RadiusStyle = "rounded" | "soft" | "sharp";
export type Density = "comfortable" | "compact";
export type FontSize = "small" | "default" | "large";
export type SidebarStyle = "expanded" | "compact";
export type TableStyle = "plain" | "striped";

export type AccentPreset = {
  id: string;
  label: string;
  /** Mid-tone hex; light/dark shades are derived from this. */
  hex: string;
};

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "blue", label: "Blue", hex: "#3b82f6" },
  { id: "indigo", label: "Indigo", hex: "#4f46e5" },
  { id: "cornflower", label: "Cornflower", hex: "#6366f1" },
  { id: "sky", label: "Sky", hex: "#0284c7" },
  { id: "cyan", label: "Cyan", hex: "#0891b2" },
  { id: "teal", label: "Teal", hex: "#0d9488" },
  { id: "forest", label: "Forest", hex: "#4f7563" },
  { id: "emerald", label: "Emerald", hex: "#059669" },
  { id: "lime", label: "Lime", hex: "#65a30d" },
  { id: "olive", label: "Olive", hex: "#65733f" },
  { id: "gold", label: "Gold", hex: "#b45309" },
  { id: "amber", label: "Amber", hex: "#ea580c" },
  { id: "terracotta", label: "Terracotta", hex: "#c2410c" },
  { id: "red", label: "Red", hex: "#dc2626" },
  { id: "rose", label: "Rose", hex: "#e11d48" },
  { id: "pink", label: "Pink", hex: "#db2777" },
  { id: "fuchsia", label: "Fuchsia", hex: "#c026d3" },
  { id: "violet", label: "Violet", hex: "#7c3aed" },
  { id: "slate", label: "Slate", hex: "#475569" },
  { id: "graphite", label: "Graphite", hex: "#27272a" },
];

export type BgKind = "flat" | "mesh" | "dots" | "lines" | "diagonal";

export type BgPreset = {
  id: string;
  label: string;
  kind: BgKind;
  /** Fixed wash colours (mesh) or line colour source (grid/lines). Never the
   *  live accent — background and accent are independent choices. */
  hues?: string[];
};

export const BG_STYLES: BgPreset[] = [
  { id: "flat", label: "Flat", kind: "flat" },
  { id: "aurora", label: "Mesh — Aurora", kind: "mesh", hues: ["#3b82f6", "#8b5cf6", "#ec4899"] },
  { id: "meadow", label: "Mesh — Meadow", kind: "mesh", hues: ["#22c55e", "#06b6d4"] },
  { id: "sunset", label: "Mesh — Sunset", kind: "mesh", hues: ["#fb923c", "#f43f5e", "#d946ef"] },
  { id: "ocean", label: "Mesh — Ocean", kind: "mesh", hues: ["#0ea5e9", "#2dd4bf", "#6366f1"] },
  { id: "candy", label: "Mesh — Candy", kind: "mesh", hues: ["#f472b6", "#a78bfa", "#38bdf8"] },
  { id: "citrus", label: "Mesh — Citrus", kind: "mesh", hues: ["#facc15", "#fb923c", "#84cc16"] },
  { id: "lagoon", label: "Mesh — Lagoon", kind: "mesh", hues: ["#14b8a6", "#3b82f6"] },
  { id: "berry", label: "Mesh — Berry", kind: "mesh", hues: ["#a855f7", "#e11d48"] },
  { id: "ember", label: "Mesh — Ember", kind: "mesh", hues: ["#f97316", "#dc2626", "#7c2d12"] },
  { id: "glacier", label: "Mesh — Glacier", kind: "mesh", hues: ["#93c5fd", "#a5f3fc"] },
  { id: "orchid", label: "Mesh — Orchid", kind: "mesh", hues: ["#c084fc", "#f0abfc"] },
  { id: "forest-mesh", label: "Mesh — Forest", kind: "mesh", hues: ["#16a34a", "#65a30d"] },
  { id: "dusk", label: "Mesh — Dusk", kind: "mesh", hues: ["#6366f1", "#4c1d95", "#ec4899"] },
  { id: "solar", label: "Mesh — Solar", kind: "mesh", hues: ["#fbbf24", "#f97316"] },
  { id: "mono", label: "Mesh — Mono", kind: "mesh", hues: ["#94a3b8", "#64748b"] },
  { id: "grid", label: "Dot grid", kind: "dots" },
  { id: "lines", label: "Line grid", kind: "lines" },
  { id: "graph", label: "Graph paper", kind: "diagonal" },
  { id: "grid-fine", label: "Fine grid", kind: "dots" },
];

export const RADIUS_STYLES: { id: RadiusStyle; label: string; px: number }[] = [
  { id: "sharp", label: "Sharp", px: 6 },
  { id: "soft", label: "Soft", px: 11 },
  { id: "rounded", label: "Rounded", px: 16 },
];

export const DENSITIES: { id: Density; label: string }[] = [
  { id: "comfortable", label: "Comfortable" },
  { id: "compact", label: "Compact" },
];

export const FONT_SIZES: { id: FontSize; label: string; px: number }[] = [
  { id: "small", label: "Small", px: 13 },
  { id: "default", label: "Default", px: 14 },
  { id: "large", label: "Large", px: 15.5 },
];

export const SIDEBAR_STYLES: { id: SidebarStyle; label: string }[] = [
  { id: "expanded", label: "Expanded" },
  { id: "compact", label: "Compact" },
];

export const TABLE_STYLES: { id: TableStyle; label: string }[] = [
  { id: "plain", label: "Plain" },
  { id: "striped", label: "Striped" },
];

/** Canonical home for the loader variant list — SwitchOverlay.tsx (the
 *  component that renders them) imports the type and id list from here
 *  rather than theme.ts importing from a component file. */
export type LoaderVariant = "bars" | "rings" | "pulse" | "dots" | "wave";

export const LOADER_VARIANTS: { id: LoaderVariant; label: string }[] = [
  { id: "bars", label: "Bars" },
  { id: "rings", label: "Orbit rings" },
  { id: "pulse", label: "Pulse mark" },
  { id: "dots", label: "Dots" },
  { id: "wave", label: "Wave" },
];

const STORAGE_KEY = "quantalog.theme";

type ThemePrefs = {
  mode: ThemeMode;
  accent: string; // preset id
  bg: string; // preset id
  radius: RadiusStyle;
  density: Density;
  loader: LoaderVariant;
  fontSize: FontSize;
  sidebar: SidebarStyle;
  table: TableStyle;
  /** Motion off disables the app's own decorative transitions/hover motion
   *  on top of whatever the OS-level prefers-reduced-motion already covers —
   *  some users want it off regardless of their system setting. */
  motion: boolean;
};

const DEFAULT_PREFS: ThemePrefs = {
  mode: "system", accent: "blue", bg: "flat", radius: "rounded", density: "comfortable",
  loader: "bars", fontSize: "default", sidebar: "expanded", table: "plain", motion: true,
};

export function readThemePrefs(): ThemePrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      mode: parsed.mode ?? DEFAULT_PREFS.mode,
      accent: parsed.accent ?? DEFAULT_PREFS.accent,
      bg: parsed.bg ?? DEFAULT_PREFS.bg,
      radius: parsed.radius ?? DEFAULT_PREFS.radius,
      density: parsed.density ?? DEFAULT_PREFS.density,
      loader: parsed.loader ?? DEFAULT_PREFS.loader,
      fontSize: parsed.fontSize ?? DEFAULT_PREFS.fontSize,
      sidebar: parsed.sidebar ?? DEFAULT_PREFS.sidebar,
      table: parsed.table ?? DEFAULT_PREFS.table,
      motion: parsed.motion ?? DEFAULT_PREFS.motion,
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

/** Fixed anchor points so every mesh preset has the same composition
 *  regardless of how many hues it carries — 1 hue reuses the first anchor,
 *  3+ ignores the rest. Kept separate from colour so hue and layout vary
 *  independently across the 20 presets. */
const MESH_ANCHORS = [
  { pos: "20% 20%", alpha: 0.22, size: 55 },
  { pos: "80% 0%", alpha: 0.18, size: 50 },
  { pos: "90% 90%", alpha: 0.14, size: 55 },
];

/** Builds the CSS `background` value for a preset, resolved against `bg`
 *  (the current theme's base colour) and `border` (for grid line presets) —
 *  both passed in rather than read from CSS so this stays a pure function. */
export function buildBgValue(preset: BgPreset, bg: string, border: string): string {
  if (preset.kind === "flat") return bg;

  if (preset.kind === "mesh") {
    const hues = preset.hues && preset.hues.length > 0 ? preset.hues : ["#3b82f6"];
    const layers = MESH_ANCHORS.map((anchor, i) => {
      const hue = hues[i % hues.length];
      return `radial-gradient(at ${anchor.pos}, color-mix(in srgb, ${hue} ${anchor.alpha * 100}%, transparent), transparent ${anchor.size}%)`;
    });
    return `${layers.join(", ")}, ${bg}`;
  }

  if (preset.kind === "dots") {
    const gap = preset.id === "grid-fine" ? 18 : 28;
    return `linear-gradient(90deg, ${border} 1px, transparent 1px) 0 0 / ${gap}px ${gap}px, linear-gradient(${border} 1px, transparent 1px) 0 0 / ${gap}px ${gap}px, ${bg}`;
  }

  if (preset.kind === "lines") {
    return `linear-gradient(${border} 1px, transparent 1px) 0 0 / 100% 36px, ${bg}`;
  }

  // diagonal ("graph paper")
  return `repeating-linear-gradient(45deg, ${border} 0, ${border} 1px, transparent 1px, transparent 22px), ${bg}`;
}

/**
 * Applies mode + accent + background + radius + density to the document
 * root. Call once on boot and again whenever a preference changes — cheap
 * enough to run on every change without debouncing.
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


  const bgPreset = BG_STYLES.find((b) => b.id === prefs.bg) ?? BG_STYLES[0];
  const bgValue = buildBgValue(bgPreset, "var(--bg)", "var(--border)");
  root.style.setProperty("--bg-wash", bgValue);
  root.setAttribute("data-bg-style", bgPreset.kind === "flat" ? "flat" : "textured");

  const radiusPx = RADIUS_STYLES.find((r) => r.id === prefs.radius)?.px ?? 16;
  root.style.setProperty("--radius", `${radiusPx}px`);
  root.style.setProperty("--radius-sm", `${Math.round(radiusPx * 0.7)}px`);
  root.style.setProperty("--radius-lg", `${Math.round(radiusPx * 1.25)}px`);
  root.style.setProperty("--mantine-radius-md", `${radiusPx}px`);

  // Density: compact trims Mantine's own spacing scale so lists, form rows,
  // and table cells sit closer together across every page at once.
  root.setAttribute("data-density", prefs.density);

  // Font size: --mantine-scale is Mantine's own multiplier, but it scales
  // *everything* — spacing, radii, avatar/badge sizes, border widths, not
  // just type (665 uses across styles.css) — so touching it here would also
  // resize buttons and inputs whenever someone just wants bigger text, and
  // compound unpredictably with the separate Density control. Each font-size
  // step is set directly instead: every Mantine Text/Title/Button/Badge
  // resolves its size from these five vars (font-size-xs..xl), and this
  // covers all of them so a size="sm"/"xs" call (most of the app's own UI
  // text) scales along with the default "md" one.
  const fontStep = FONT_SIZES.find((f) => f.id === prefs.fontSize) ?? FONT_SIZES[1];
  const scaleFactor = fontStep.px / 14;
  const FONT_BASE: Record<string, number> = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 };
  for (const [step, basePx] of Object.entries(FONT_BASE)) {
    root.style.setProperty(`--mantine-font-size-${step}`, `${Math.round(basePx * scaleFactor * 10) / 10}px`);
  }
  root.style.setProperty("--font-scale", String(scaleFactor));

  root.setAttribute("data-sidebar-style", prefs.sidebar);
  root.setAttribute("data-table-style", prefs.table);
  root.setAttribute("data-motion", prefs.motion ? "on" : "off");
}

export function loadAndApplyTheme(): ThemePrefs {
  const prefs = readThemePrefs();
  applyTheme(prefs);
  return prefs;
}

/** The chosen loading-screen animation. Read directly by whatever renders
 *  SwitchVisual — boot screen, workspace/site switch — rather than pushed
 *  through a CSS var, since it selects a React branch, not a style. */
export function getLoaderVariant(): LoaderVariant {
  return readThemePrefs().loader;
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Briefly enables a CSS transition on colour/background properties so a
 * mode, accent, or background change crossfades instead of snapping. Scoped
 * to a class toggled on <html> for ~350ms rather than left on permanently —
 * see the `.theme-transitioning` rule in App.css for why.
 */
export function withThemeTransition(apply: () => void) {
  const root = document.documentElement;
  root.classList.add("theme-transitioning");
  apply();
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => {
    root.classList.remove("theme-transitioning");
  }, 360);
}

export type { ThemePrefs };
