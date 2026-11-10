const DEMO_UNSUPPORTED_ROUTES: { prefix: string; name: string }[] = [
  { prefix: "/app/lead-capture", name: "Lead capture" },
  { prefix: "/app/invoices", name: "Invoicing" },
  { prefix: "/app/orbit", name: "Orbit AI" },
  { prefix: "/app/search-visibility", name: "AI search visibility" },
  { prefix: "/app/link/", name: "Custom links" },
  { prefix: "/app/onboarding", name: "Onboarding" },
];

export function demoUnsupportedFeature(pathname: string): string | null {
  return DEMO_UNSUPPORTED_ROUTES.find((route) => pathname.startsWith(route.prefix))?.name ?? null;
}
