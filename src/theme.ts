import { createTheme, rem } from "@mantine/core";

// Modern SaaS dark-first theme, violet accent.
export const theme = createTheme({
  primaryColor: "violet",
  primaryShade: { light: 6, dark: 5 },
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
  defaultRadius: "lg",
  colors: {
    // tuned violet ramp (matches #7c5cff family)
    violet: [
      "#f2effe", "#e3dcfb", "#c6b9f6", "#a88ff1", "#8f6bee",
      "#7c5cff", "#7048f5", "#5f3ad9", "#4f30b3", "#3f268f",
    ],
    // premium neutral dark surfaces
    dark: [
      "#C1C2C5", "#A6A7AB", "#909296", "#5c5f66", "#373A40",
      "#2C2E33", "#25262b", "#1a1b1e", "#141517", "#0c0d10",
    ],
  },
  shadows: {
    md: "0 8px 24px -8px rgba(0,0,0,0.5)",
    lg: "0 16px 48px -12px rgba(0,0,0,0.6)",
  },
  components: {
    Card: { defaultProps: { radius: "lg" } },
    Button: { defaultProps: { radius: "md" } },
    Paper: { defaultProps: { radius: "lg" } },
  },
});
