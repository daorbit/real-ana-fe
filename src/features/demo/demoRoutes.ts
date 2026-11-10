const DEMO_UNSUPPORTED_ROUTES: { prefix: string; name: string }[] = [
  { prefix: "/app/onboarding", name: "Onboarding" },
];

export function demoUnsupportedFeature(pathname: string): string | null {
  return DEMO_UNSUPPORTED_ROUTES.find((route) => pathname.startsWith(route.prefix))?.name ?? null;
}
