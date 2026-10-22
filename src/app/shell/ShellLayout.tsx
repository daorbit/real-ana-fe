import { Suspense, useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { RouteFallback } from "@/shared/ui/RouteFallback";
import { prefetchCommonRoutes } from "@/app/routePrefetch";
import { useDismissOnFrameFocus } from "@/shared/hooks/useDismissOnFrameFocus";
import { ShellFrame } from "../AppShell";

export function ShellLayout() {
  const outlet = useOutlet();
  const { pathname } = useLocation();

  useEffect(() => prefetchCommonRoutes(), []);
  useDismissOnFrameFocus();

  return (
    <ShellFrame>
      <ErrorBoundary variant="route" resetKey={pathname}>
        <Suspense fallback={<RouteFallback />}>{outlet}</Suspense>
      </ErrorBoundary>
    </ShellFrame>
  );
}
