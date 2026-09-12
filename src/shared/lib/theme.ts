export type ThemeMode = "system" | "light" | "dark";
export type RadiusStyle = "rounded" | "soft" | "sharp";
export type Density = "comfortable" | "compact";
export type FontSize = "small" | "default" | "large";
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
  { id: "white", label: "White", hex: "#f8fafc" },
];

export type BgKind =
  | "flat"
  | "mesh"
  | "wash"
  | "dots"
  | "lines"
  | "diagonal"
  | "stars"
  | "corners";

export type BgPreset = {
  id: string;
  label: string;
  kind: BgKind;
  hues?: string[];
};

export const BG_STYLES: BgPreset[] = [
  { id: "flat", label: "Flat", kind: "flat" },

  {
    id: "classic",
    label: "Classic",
    kind: "corners",
    hues: ["#818cf8", "#eab308"],
  },
  {
    id: "aurora",
    label: "Mesh — Aurora",
    kind: "mesh",
    hues: ["#3b82f6", "#8b5cf6", "#ec4899"],
  },
  {
    id: "meadow",
    label: "Mesh — Meadow",
    kind: "mesh",
    hues: ["#22c55e", "#06b6d4"],
  },
  {
    id: "sunset",
    label: "Mesh — Sunset",
    kind: "mesh",
    hues: ["#fb923c", "#f43f5e", "#d946ef"],
  },
  {
    id: "ocean",
    label: "Mesh — Ocean",
    kind: "mesh",
    hues: ["#0ea5e9", "#2dd4bf", "#6366f1"],
  },
  {
    id: "candy",
    label: "Mesh — Candy",
    kind: "mesh",
    hues: ["#f472b6", "#a78bfa", "#38bdf8"],
  },
  {
    id: "citrus",
    label: "Mesh — Citrus",
    kind: "mesh",
    hues: ["#facc15", "#fb923c", "#84cc16"],
  },
  {
    id: "lagoon",
    label: "Mesh — Lagoon",
    kind: "mesh",
    hues: ["#14b8a6", "#3b82f6"],
  },
  {
    id: "berry",
    label: "Mesh — Berry",
    kind: "mesh",
    hues: ["#a855f7", "#e11d48"],
  },
  {
    id: "ember",
    label: "Mesh — Ember",
    kind: "mesh",
    hues: ["#f97316", "#dc2626", "#7c2d12"],
  },
  {
    id: "glacier",
    label: "Mesh — Glacier",
    kind: "mesh",
    hues: ["#93c5fd", "#a5f3fc"],
  },
  {
    id: "orchid",
    label: "Mesh — Orchid",
    kind: "mesh",
    hues: ["#c084fc", "#f0abfc"],
  },
  {
    id: "forest-mesh",
    label: "Mesh — Forest",
    kind: "mesh",
    hues: ["#16a34a", "#65a30d"],
  },
  {
    id: "dusk",
    label: "Mesh — Dusk",
    kind: "mesh",
    hues: ["#6366f1", "#4c1d95", "#ec4899"],
  },
  {
    id: "solar",
    label: "Mesh — Solar",
    kind: "mesh",
    hues: ["#fbbf24", "#f97316"],
  },
  {
    id: "mono",
    label: "Mesh — Mono",
    kind: "mesh",
    hues: ["#94a3b8", "#64748b"],
  },

  {
    id: "wash-nordic",
    label: "Wash — Nordic",
    kind: "wash",
    hues: ["#86efac", "#38bdf8", "#3b5bdb"],
  },
  {
    id: "wash-twilight",
    label: "Wash — Twilight",
    kind: "wash",
    hues: ["#312e81", "#7c3aed", "#f472b6"],
  },
  {
    id: "wash-horizon",
    label: "Wash — Horizon",
    kind: "wash",
    hues: ["#fb923c", "#e11d48", "#4c1d95"],
  },
  {
    id: "wash-tidal",
    label: "Wash — Tidal",
    kind: "wash",
    hues: ["#0d9488", "#0ea5e9", "#1e3a8a"],
  },
  {
    id: "wash-linen",
    label: "Wash — Linen",
    kind: "wash",
    hues: ["#fde68a", "#fca5a5", "#c084fc"],
  },
  {
    id: "wash-basalt",
    label: "Wash — Basalt",
    kind: "wash",
    hues: ["#64748b", "#334155", "#0f172a"],
  },
  {
    id: "wash-verdant",
    label: "Wash — Verdant",
    kind: "wash",
    hues: ["#a3e635", "#16a34a", "#0f766e"],
  },
  {
    id: "wash-plum",
    label: "Wash — Plum",
    kind: "wash",
    hues: ["#f0abfc", "#a21caf", "#1e1b4b"],
  },

  { id: "stars", label: "Starfield", kind: "stars" },
  { id: "stars-dense", label: "Starfield — Dense", kind: "stars" },
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

export const TABLE_STYLES: { id: TableStyle; label: string }[] = [
  { id: "plain", label: "Plain" },
  { id: "striped", label: "Striped" },
];

const STORAGE_KEY = "quantalog.theme";

export type ThemePresetId = "none" | "classic";

export type ThemePreset = {
  id: ThemePresetId;
  label: string;
  swatch: string;
  apply?: { accent: string; bg: string; cta: CtaScheme };
};

export type CtaScheme = "accent" | "neutral";

export const THEME_PRESETS: ThemePreset[] = [
  { id: "none", label: "Custom", swatch: "var(--surface-2)" },
  {
    id: "classic",
    label: "Classic",
    swatch:
      "radial-gradient(58% 80% at 0 0, #818cf83d, transparent 62%), radial-gradient(58% 80% at 100% 0, #eab30826, transparent 62%), var(--surface-2)",

    apply: { accent: "white", bg: "classic", cta: "neutral" },
  },
];

type ThemePrefs = {
  mode: ThemeMode;
  preset: ThemePresetId;
  cta: CtaScheme;
  accent: string; // preset id
  bg: string; // preset id
  radius: RadiusStyle;
  density: Density;
  fontSize: FontSize;
  table: TableStyle;

  motion: boolean;
};

const DEFAULT_PREFS: ThemePrefs = {
  mode: "system",
  preset: "none",
  cta: "accent",
  accent: "blue",
  bg: "flat",
  radius: "rounded",
  density: "comfortable",
  fontSize: "default",
  table: "plain",
  motion: true,
};

export function readThemePrefs(): ThemePrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      mode: parsed.mode ?? DEFAULT_PREFS.mode,
      preset: parsed.preset ?? DEFAULT_PREFS.preset,
      cta: parsed.cta ?? DEFAULT_PREFS.cta,
      accent: parsed.accent ?? DEFAULT_PREFS.accent,
      bg: parsed.bg ?? DEFAULT_PREFS.bg,
      radius: parsed.radius ?? DEFAULT_PREFS.radius,
      density: parsed.density ?? DEFAULT_PREFS.density,
      fontSize: parsed.fontSize ?? DEFAULT_PREFS.fontSize,
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
/** Black or white, whichever stays readable on top of `hex`. */
export function contrastOn(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
    ? "#0a0b0d"
    : "#ffffff";
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
/** Mixes a hex color toward white (amount > 0) or black (amount < 0). */
function shade(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  return rgbToHex(
    r + (target - r) * t,
    g + (target - g) * t,
    b + (target - b) * t,
  );
}

function buildScale(hex: string, anchor: number): string[] {
  const steps = [0.92, 0.8, 0.64, 0.44, 0.22, 0.08, -0.14, -0.3, -0.46, -0.6];
  const at = steps[anchor];
  return steps.map((s, i) => {
    if (i === anchor) return hex;

    const rel =
      s > at
        ? (s - at) / (steps[0] - at) // 0..1 towards white
        : (s - at) / (at - steps[9]); // 0..-1 towards black
    return shade(hex, rel * (s > at ? 0.92 : 0.72));
  });
}

const MESH_ANCHORS = [
  { pos: "20% 20%", alpha: 0.22, size: 55 },
  { pos: "80% 0%", alpha: 0.18, size: 50 },
  { pos: "90% 90%", alpha: 0.14, size: 55 },
];

const WASH_ALPHA = 0.3;

export function buildBgValue(
  preset: BgPreset,
  bg: string,
  border: string,
): string {
  if (preset.kind === "flat") return bg;

  if (preset.kind === "mesh") {
    const hues =
      preset.hues && preset.hues.length > 0 ? preset.hues : ["#3b82f6"];
    const layers = MESH_ANCHORS.map((anchor, i) => {
      const hue = hues[i % hues.length];
      return `radial-gradient(at ${anchor.pos}, color-mix(in srgb, ${hue} ${anchor.alpha * 100}%, transparent), transparent ${anchor.size}%)`;
    });
    return `${layers.join(", ")}, ${bg}`;
  }

  if (preset.kind === "wash") {
    const hues =
      preset.hues && preset.hues.length > 0 ? preset.hues : ["#3b82f6"];

    const stops = hues
      .map((hue, i) => {
        const pct = hues.length === 1 ? 50 : (i / (hues.length - 1)) * 100;
        return `color-mix(in srgb, ${hue} ${WASH_ALPHA * 100}%, transparent) ${Math.round(pct)}%`;
      })
      .join(", ");

    const glow = `radial-gradient(120% 80% at 12% 8%, color-mix(in srgb, ${hues[0]} 18%, transparent), transparent 60%)`;
    return `${glow}, linear-gradient(145deg, ${stops}), ${bg}`;
  }

  if (preset.kind === "corners") {
    const [indigo, amber] =
      preset.hues && preset.hues.length >= 2
        ? preset.hues
        : ["#818cf8", "#eab308"];
    const left = `radial-gradient(55% 80% at 0% 0%, color-mix(in srgb, ${indigo} 16%, transparent), transparent 62%)`;
    const right = `radial-gradient(55% 80% at 100% 0%, color-mix(in srgb, ${amber} 12%, transparent), transparent 62%)`;
    return `${left}, ${right}, ${bg}`;
  }

  if (preset.kind === "stars") return bg;

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

export function applyTheme(prefs: ThemePrefs) {
  const root = document.documentElement;

  if (prefs.mode === "system") {
    root.removeAttribute("data-theme-mode");
  } else {
    root.setAttribute("data-theme-mode", prefs.mode);
  }

  const preset =
    ACCENT_PRESETS.find((p) => p.id === prefs.accent) ?? ACCENT_PRESETS[0];
  const dark =
    prefs.mode === "dark" ||
    (prefs.mode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const accent = preset.hex;

  const { r: ar, g: ag, b: ab } = hexToRgb(preset.hex);
  const accentLuminance = (0.299 * ar + 0.587 * ag + 0.114 * ab) / 255;
  const accent2 =
    accentLuminance > 0.75
      ? "var(--text)"
      : dark
        ? shade(preset.hex, 0.12)
        : shade(preset.hex, -0.15);
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

  const primaryShadeIdx = dark ? 7 : 6;
  const scale = buildScale(preset.hex, primaryShadeIdx);
  scale.forEach((c, i) => {
    root.style.setProperty(`--mantine-color-emerald-${i}`, c);
  });
  const filled = scale[primaryShadeIdx];
  const filledHover = scale[Math.min(primaryShadeIdx + 1, 9)];

  const filledText = contrastOn(filled);
  root.style.setProperty("--tabs-text-color", filledText);

  root.style.setProperty("--button-color", filledText);
  root.style.setProperty("--section-color", filledText);

  root.style.setProperty("--accent-contrast", filledText);

  for (const name of ["emerald", "primary"]) {
    root.style.setProperty(`--mantine-color-${name}-filled`, filled);
    root.style.setProperty(`--mantine-color-${name}-filled-hover`, filledHover);
    root.style.setProperty(`--mantine-color-${name}-light`, accentSoft);
    root.style.setProperty(`--mantine-color-${name}-light-hover`, accentSoft);
    root.style.setProperty(
      `--mantine-color-${name}-light-color`,
      scale[dark ? 4 : 6],
    );
    root.style.setProperty(
      `--mantine-color-${name}-text`,
      dark ? scale[4] : filled,
    );
    root.style.setProperty(`--mantine-color-${name}-outline`, filled);
    root.style.setProperty(`--mantine-color-${name}-outline-hover`, accentSoft);
  }
  for (let i = 0; i < 10; i++) {
    root.style.setProperty(`--mantine-primary-color-${i}`, scale[i]);
  }

  const bgPreset = BG_STYLES.find((b) => b.id === prefs.bg) ?? BG_STYLES[0];
  const bgValue = buildBgValue(bgPreset, "var(--bg)", "var(--border)");
  root.style.setProperty("--bg-wash", bgValue);
  // "stars" still paints through every `textured` rule; the extra attribute is
  // what lets the CSS attach the drift animation to that one kind.
  root.setAttribute(
    "data-bg-style",
    bgPreset.kind === "flat" ? "flat" : "textured",
  );
  root.toggleAttribute("data-bg-animated", bgPreset.kind === "stars");

  const cta =
    prefs.cta === "neutral"
      ? dark
        ? { bg: "#ffffff", bgHover: "#e9eaec", fg: "#0a0b0d" }
        : { bg: "#4f46e5", bgHover: "#4338ca", fg: "#ffffff" }
      : {
          bg: "var(--accent)",
          bgHover: "var(--accent-2)",
          fg: contrastOn(accent),
        };
  root.style.setProperty("--cta", cta.bg);
  root.style.setProperty("--cta-hover", cta.bgHover);
  root.style.setProperty("--cta-fg", cta.fg);

  root.style.setProperty("--rail-wash", "var(--rail)");
  root.setAttribute("data-theme-preset", prefs.preset);

  const radiusPx = RADIUS_STYLES.find((r) => r.id === prefs.radius)?.px ?? 16;
  root.style.setProperty("--radius", `${radiusPx}px`);
  root.style.setProperty("--radius-sm", `${Math.round(radiusPx * 0.7)}px`);
  root.style.setProperty("--radius-lg", `${Math.round(radiusPx * 1.25)}px`);
  root.style.setProperty("--mantine-radius-md", `${radiusPx}px`);

  root.setAttribute("data-density", prefs.density);

  const fontStep =
    FONT_SIZES.find((f) => f.id === prefs.fontSize) ?? FONT_SIZES[1];
  const scaleFactor = fontStep.px / 14;
  const FONT_BASE: Record<string, number> = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  };
  for (const [step, basePx] of Object.entries(FONT_BASE)) {
    root.style.setProperty(
      `--mantine-font-size-${step}`,
      `${Math.round(basePx * scaleFactor * 10) / 10}px`,
    );
  }
  root.style.setProperty("--font-scale", String(scaleFactor));

  root.setAttribute("data-table-style", prefs.table);
  root.setAttribute("data-motion", prefs.motion ? "on" : "off");

  window.dispatchEvent(new CustomEvent("quantalog-theme-change"));

  if (dark) {
    root.style.setProperty("--mantine-color-dark-4", "var(--border-strong)");
    root.style.setProperty("--mantine-color-dark-5", "var(--surface-2)");
    root.style.setProperty("--mantine-color-dark-6", "var(--surface)");
    root.style.setProperty("--mantine-color-dark-7", "var(--bg-2)");
    root.style.setProperty("--mantine-color-dark-8", "var(--bg)");
  } else {
    root.style.removeProperty("--mantine-color-dark-4");
    root.style.removeProperty("--mantine-color-dark-5");
    root.style.removeProperty("--mantine-color-dark-6");
    root.style.removeProperty("--mantine-color-dark-7");
    root.style.removeProperty("--mantine-color-dark-8");
  }
}

export function loadAndApplyTheme(): ThemePrefs {
  const prefs = readThemePrefs();
  applyTheme(prefs);
  return prefs;
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null;
let pulseTimer: ReturnType<typeof setTimeout> | null = null;

export function withThemeTransition(apply: () => void) {
  const root = document.documentElement;
  root.classList.add("theme-transitioning", "theme-pulse");
  apply();
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => {
    root.classList.remove("theme-transitioning");
  }, 360);
  if (pulseTimer) clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => {
    root.classList.remove("theme-pulse");
  }, 700);
}

export type { ThemePrefs };
