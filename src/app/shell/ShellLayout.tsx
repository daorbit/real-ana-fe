import { Suspense, useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { RouteFallback } from "@/shared/ui/RouteFallback";
import { prefetchAllRoutes } from "@/app/routePrefetch";
import { ShellFrame } from "../AppShell";

export function ShellLayout() {
  const outlet = useOutlet();
  const { pathname } = useLocation();

  useEffect(() => prefetchAllRoutes(), []);

  return (
    <ShellFrame>
      <ErrorBoundary variant="route" resetKey={pathname}>
        <Suspense fallback={<RouteFallback />}>{outlet}</Suspense>
      </ErrorBoundary>
    </ShellFrame>
  );
}
