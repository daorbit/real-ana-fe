import { useEffect, useState } from "react";
import { PageSkeleton } from "@/shared/ui/Skeletons";

const SHOW_AFTER_MS = 150;

export function RouteFallback() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div role="status" aria-live="polite" aria-label="Loading page">
      <PageSkeleton />
    </div>
  );
}
