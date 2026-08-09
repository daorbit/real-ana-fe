import { createTheme, rem } from "@mantine/core";

// Professional dark-first theme, emerald accent, flat surfaces.
export const theme = createTheme({
  primaryColor: "emerald",
  // Dark mode: use a deeper shade so filled surfaces don't glare neon.
  primaryShade: { light: 6, dark: 7 },
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  fontFamilyMonospace: "ui-monospace, 'SF Mono', Menlo, monospace",
  headings: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: rem(30), lineHeight: "1.2" },
      h2: { fontSize: rem(23), lineHeight: "1.25" },
      h3: { fontSize: rem(18), lineHeight: "1.3" },
    },
  },
  defaultRadius: "md",
  // Mantine ships checkboxes, switches and radios with the default arrow
  // cursor, which makes them read as labels rather than controls. One setting
  // covers every such input in the app.
  cursorType: "pointer",
  colors: {
    emerald: [
      "#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399",
      "#10b981", "#059669", "#047857", "#065f46", "#064e3b",
    ],
    // neutral dark surfaces (no purple cast)
    dark: [
      "#c9ced6", "#a8aeb8", "#8b929e", "#5f6673", "#3a3f4a",
      "#2b2f38", "#22252c", "#1a1c22", "#131519", "#0b0c0f",
    ],
  },
  shadows: {
    md: "0 8px 24px -8px rgba(0,0,0,0.45)",
    lg: "0 16px 40px -12px rgba(0,0,0,0.55)",
  },
  components: {
    // The default Mantine loader is bouncing dots, which looks toy-ish inside
    // buttons and panels. Spin instead, everywhere, in one place.
    Loader: { defaultProps: { type: "oval" } },
    /**
     * Badges read as text, not as pills.
     *
     * Mantine's `light` variant paints a tinted rounded capsule behind every
     * badge. At the density this app runs — a score in every history row, a
     * severity tag on every issue, a status chip on every table row — that
     * produced a page of coloured lozenges competing with the content they
     * were labelling. The colour still carries the meaning; the container was
     * the only thing doing decoration, so it goes.
     *
     * `transparent` keeps Mantine's `color` prop driving the text colour, so
     * all 112 call sites keep working unchanged and no per-file edit is needed.
     */
    Badge: {
      // `vars` rather than `defaultProps`: 88 of the call sites pass
      // `variant="light"` explicitly, and an explicit prop always beats a
      // default — so overriding the variant would have missed most of them.
      // The variant still computes `--badge-color` from the `color` prop;
      // these three lines strip the capsule it paints behind it.
      vars: () => ({
        root: {
          "--badge-bg": "transparent",
          "--badge-bd": "none",
          "--badge-radius": "0",
        },
      }),
      styles: {
        root: {
          paddingInline: 0,
          textTransform: "none",
          fontWeight: 650,
          // Mantine sizes badges by a fixed capsule height; without the
          // capsule that only adds dead vertical space around the text.
          height: "auto",
          lineHeight: 1.35,
          letterSpacing: "0.01em",
          // Digits in a column must line up; badges here are mostly counts.
          fontVariantNumeric: "tabular-nums",
        },
      },
    },
    Card: { defaultProps: { radius: "md" } },
    Button: { defaultProps: { radius: "md" } },
    Paper: { defaultProps: { radius: "md" } },
    Input: { defaultProps: { radius: 8 } },
    TextInput: { defaultProps: { radius: 8 } },
    PasswordInput: { defaultProps: { radius: 8 } },
    Select: { defaultProps: { radius: 8 } },
  },
});
