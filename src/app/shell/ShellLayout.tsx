import { Suspense } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { ShellFrame } from "../AppShell";

export function ShellLayout() {
  const outlet = useOutlet();
  const { pathname } = useLocation();

  return (
    <ShellFrame>
      <ErrorBoundary variant="route" resetKey={pathname}>
        <Suspense fallback={null}>{outlet}</Suspense>
      </ErrorBoundary>
    </ShellFrame>
  );
}
