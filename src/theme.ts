import { createTheme } from "@mantine/core";

// Indigo-accented light theme.
export const theme = createTheme({
  primaryColor: "indigo",
  primaryShade: 6,
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  headings: { fontFamily: "Inter, system-ui, sans-serif", fontWeight: "650" },
  defaultRadius: "md",
  colors: {
    // custom indigo tuned to #4f46e5
    indigo: [
      "#eef2ff", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8",
      "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81",
    ],
  },
});
