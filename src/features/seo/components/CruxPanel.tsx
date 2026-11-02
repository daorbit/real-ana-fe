import type { CruxVitals } from "@/shared/types";
import { SeoSection } from "@/features/seo/components/shared/SeoCard";
import { Pill } from "@/features/seo/components/shared/Pill";
import { Tiles } from "@/features/seo/components/shared/Tile";
import type { Tone } from "@/features/seo/components/shared/tone";
import { VitalCard } from "@/features/seo/components/panels/performance/VitalCard";
import { VITALS, formatVital } from "@/features/seo/components/panels/performance/vitalMeta";

const BAND: Record<CruxVitals["overall"], { tone: Tone; label: string }> = {
  FAST: { tone: "good", label: "Passing" },
  AVERAGE: { tone: "warn", label: "Needs work" },
  SLOW: { tone: "bad", label: "Failing" },
  NONE: { tone: "neutral", label: "No data" },
};

export function CruxPanel({ crux }: { crux?: CruxVitals }) {
  if (!crux?.available) return null;

  const overall = BAND[crux.overall];

  return (
    <SeoSection
      title="Core Web Vitals"
      description={
        crux.scope === "url"
          ? "How this page performed for real Chrome visitors over the last 28 days. This is the data Google ranks on."
          : "Chrome has too few visits to report on this page alone, so these are site-wide figures over the last 28 days."
      }
      right={<Pill tone={overall.tone}>{overall.label}</Pill>}
    >
      <Tiles wide>
        {VITALS.map((v) => {
          const metric = crux.metrics[v.key];
          const band = BAND[metric?.category ?? "NONE"];
          return (
            <VitalCard
              key={v.key}
              label={v.label}
              name={v.name}
              hint={v.hint}
              value={formatVital(metric?.p75 ?? null, v.unit)}
              status={band.label}
              tone={band.tone}
              split={metric ? { good: metric.good, mid: metric.needsImprovement, poor: metric.poor } : undefined}
            />
          );
        })}
      </Tiles>
    </SeoSection>
  );
}
