import type { SeoFieldVitals, SeoVitalSummary } from "@/shared/types";
import { num } from "@/shared/lib";
import { SeoCard, SeoSection } from "@/features/seo/components/shared/SeoCard";
import { Pill } from "@/features/seo/components/shared/Pill";
import { ListHead, SeoList } from "@/features/seo/components/shared/SeoList";
import { Tiles } from "@/features/seo/components/shared/Tile";
import type { Tone } from "@/features/seo/components/shared/tone";
import { VitalCard } from "@/features/seo/components/panels/performance/VitalCard";
import { VITALS, formatVital } from "@/features/seo/components/panels/performance/vitalMeta";
import sharedClasses from "@/features/seo/components/shared/seoUi.module.css";
import classes from "@/features/seo/components/panels/performance/performance.module.css";

const RATING: Record<SeoVitalSummary["rating"], { tone: Tone; label: string }> = {
  good: { tone: "good", label: "Passing" },
  "needs-improvement": { tone: "warn", label: "Needs work" },
  poor: { tone: "bad", label: "Failing" },
  none: { tone: "neutral", label: "No data" },
};

function lcpTone(lcp: number | null): Tone {
  if (lcp === null) return "neutral";
  return lcp <= 2500 ? "good" : lcp <= 4000 ? "warn" : "bad";
}

export function VitalsPanel({ vitals }: { vitals?: SeoFieldVitals }) {
  if (!vitals) return null;

  if (vitals.samples === 0) {
    const needsUpgrade = vitals.trackerVersion < vitals.requiredVersion;
    return (
      <SeoSection title="Your visitors" description="Core Web Vitals as your own visitors experienced them.">
        <SeoCard>
          <p className={classes.noteTitle}>
            {needsUpgrade ? "Your tracking snippet is out of date" : "No measurements yet"}
          </p>
          <p className={classes.note}>
            {needsUpgrade
              ? `This site reports tracker v${vitals.trackerVersion}, and real-user vitals need v${vitals.requiredVersion}. Copy the snippet again from the site's settings and data starts arriving as visitors load the new script.`
              : "Your tracker is current, so vitals appear once real visitors have loaded the page."}
          </p>
        </SeoCard>
      </SeoSection>
    );
  }

  return (
    <SeoSection
      title="Your visitors"
      description={`75th percentile over ${vitals.days} days · ${num(vitals.samples)} page loads measured.`}
    >
      <Tiles wide>
        {VITALS.map((v) => {
          const s = vitals.metrics[v.key];
          const rating = RATING[s.rating];
          return (
            <VitalCard
              key={v.key}
              label={v.label}
              name={v.name}
              hint={v.hint}
              value={formatVital(s.p75, v.unit)}
              status={rating.label}
              tone={rating.tone}
              split={s.samples > 0 ? { good: s.good, mid: s.needsImprovement, poor: s.poor } : undefined}
              foot={s.samples > 0 ? `${s.good}% good · ${num(s.samples)} samples` : undefined}
            />
          );
        })}
      </Tiles>

      {vitals.byPage.length > 0 && (
        <SeoList>
          <ListHead>
            <span className={classes.colGrow}>Slowest pages</span>
            <span className={classes.colNum}>LCP</span>
            <span className={classes.colNum}>CLS</span>
            <span className={classes.colNum}>Samples</span>
          </ListHead>
          {vitals.byPage.map((p) => (
            <div key={p.path} className={sharedClasses.row}>
              <span className={`${classes.colGrow} ${sharedClasses.mono} ${sharedClasses.rowSub}`} title={p.path}>
                {p.path}
              </span>
              <span className={classes.colNum}>
                <Pill tone={lcpTone(p.lcp)}>{formatVital(p.lcp, "s")}</Pill>
              </span>
              <span className={`${classes.colNum} ${sharedClasses.rowMeta}`}>{formatVital(p.cls, "")}</span>
              <span className={`${classes.colNum} ${sharedClasses.rowMeta}`}>{num(p.samples)}</span>
            </div>
          ))}
        </SeoList>
      )}
    </SeoSection>
  );
}
