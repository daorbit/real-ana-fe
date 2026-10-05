import type { Branding } from "@/shared/types";

/** Matches the emerald already used for demoData's theme-color meta tag. */
const DEMO_ACCENT = "#10b981";

export const demoBranding: Branding = {
  name: "Acme Inc.",
  logoUrl: "https://acme.example/logo.svg",
  accentColor: DEMO_ACCENT,
  showPoweredBy: false,
  poweredByLabel: "Powered by Quantalog Forms",
  // The demo workspace is on Pro, same as demoWorkspaces[0].billing — Free
  // would show the upgrade notice instead of the fields being demoed.
  editable: true,
  watermarkAiImages: false,
  defaults: { name: "Quantalog", logoUrl: undefined },
  stored: {
    name: "Acme Inc.",
    logoUrl: "https://acme.example/logo.svg",
    accentColor: DEMO_ACCENT,
    hidePoweredBy: true,
    watermarkAiImages: false,
  },
};
