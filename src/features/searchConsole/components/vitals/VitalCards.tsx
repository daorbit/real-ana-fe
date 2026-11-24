import type { SearchWebVitals } from "@/shared/types";
import { Tiles } from "@/features/seo/components/shared/Tile";
import { VitalCard } from "@/features/seo/components/panels/performance/VitalCard";
import { VITALS, VITAL_RATING, formatVital } from "@/features/seo/components/panels/performance/vitalMeta";

export function VitalCards({ data }: { data: SearchWebVitals }) {
  return (
    <Tiles wide>
      {VITALS.map((v) => {
        const vital = data.metrics[v.key];
        const band = VITAL_RATING[vital?.rating ?? "none"];
        return (
          <VitalCard
            key={v.key}
            label={v.label}
            name={v.name}
            hint={v.hint}
            value={formatVital(vital?.p75 ?? null, v.unit)}
            status={band.label}
            tone={band.tone}
            split={vital ? { good: vital.good, mid: vital.needsImprovement, poor: vital.poor } : undefined}
            foot={
              vital && vital.previousP75 !== null
                ? `${vital.good}% good · ${formatVital(vital.previousP75, v.unit)} four weeks before`
                : undefined
            }
          />
        );
      })}
    </Tiles>
  );
}
