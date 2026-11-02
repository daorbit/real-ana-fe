import type { ReactNode } from "react";
import type { SeoPerformance } from "@/shared/types";
import { CruxPanel } from "@/features/seo/components/CruxPanel";
import { DiagnosticsPanel } from "@/features/seo/components/DiagnosticsPanel";
import { LighthouseSection } from "./performance/LighthouseSection";

export function PerformancePanel({
  performance,
  vitals,
  suggestions,
}: {
  performance: SeoPerformance;
  vitals?: ReactNode;
  suggestions?: ReactNode;
}) {
  return (
    <div>
      {performance.available && <LighthouseSection performance={performance} />}
      <CruxPanel crux={performance.crux} />
      {vitals}
      {suggestions}
      <DiagnosticsPanel diagnostics={performance.diagnostics} />
    </div>
  );
}
