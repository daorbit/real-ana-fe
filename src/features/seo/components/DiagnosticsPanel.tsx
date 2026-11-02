import { Progress } from "@mantine/core";
import type { SeoDiagnostics } from "@/shared/types";
import { SeoCard, SeoSection } from "@/features/seo/components/shared/SeoCard";
import { ListHead, SeoList } from "@/features/seo/components/shared/SeoList";
import sharedClasses from "@/features/seo/components/shared/seoUi.module.css";
import classes from "@/features/seo/components/panels/performance/performance.module.css";

const TYPE_LABEL: Record<string, string> = {
  script: "JavaScript",
  stylesheet: "CSS",
  image: "Images",
  font: "Fonts",
  document: "HTML",
  media: "Media",
  other: "Other",
  "third-party": "Third party",
};

function kb(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function ms(value: number | null): string {
  if (value === null) return "—";
  if (value >= 1000) return `${(value / 1000).toFixed(1)} s`;
  return `${Math.round(value)} ms`;
}

export function DiagnosticsPanel({ diagnostics }: { diagnostics?: SeoDiagnostics }) {
  if (!diagnostics) return null;

  const { byType, totalBytes, totalRequests, thirdParty } = diagnostics;
  const hasComposition = byType.length > 0 && Boolean(totalBytes);
  const hasThirdParty = thirdParty.length > 0;

  if (!hasComposition && !hasThirdParty && diagnostics.domElements === null) return null;

  return (
    <SeoSection
      title="Page composition"
      description={
        totalRequests !== null && totalBytes !== null
          ? `${totalRequests} requests · ${kb(totalBytes)} transferred.`
          : "What the page is made of, and what third parties cost it."
      }
    >
      <div className="seo-bento">
        {hasComposition && (
          <SeoCard className={hasThirdParty ? "col-6" : "col-12"} title="Transfer size by type">
            <div className={classes.composition}>
              {byType.slice(0, 7).map((row) => (
                <div key={row.type} className={sharedClasses.bar}>
                  <div className={sharedClasses.barTop}>
                    <span>{TYPE_LABEL[row.type] ?? row.type}</span>
                    <span className={sharedClasses.barValue}>
                      {kb(row.bytes)} · {row.requests}
                    </span>
                  </div>
                  <Progress
                    value={totalBytes ? (row.bytes / totalBytes) * 100 : 0}
                    color="var(--accent)"
                    size={6}
                    radius="xl"
                    classNames={{ root: sharedClasses.track }}
                  />
                </div>
              ))}
            </div>
            <div className={classes.stats}>
              <Stat label="DOM elements" value={diagnostics.domElements?.toLocaleString() ?? "—"} />
              <Stat label="Main thread" value={ms(diagnostics.mainThreadMs)} />
              <Stat label="Server response" value={ms(diagnostics.serverResponseMs)} />
            </div>
          </SeoCard>
        )}

        {hasThirdParty && (
          <SeoList className={hasComposition ? "col-6" : "col-12"}>
            <ListHead>
              <span className={classes.colGrow}>Third party</span>
              <span className={classes.colNum}>Blocking</span>
              <span className={classes.colNum}>Size</span>
            </ListHead>
            {thirdParty.slice(0, 8).map((t) => (
              <div key={t.entity} className={sharedClasses.row}>
                <span className={`${classes.colGrow} ${sharedClasses.rowText}`}>{t.entity}</span>
                <span className={`${classes.colNum} ${sharedClasses.rowMeta}`}>{t.blockingMs ? ms(t.blockingMs) : "—"}</span>
                <span className={`${classes.colNum} ${sharedClasses.rowMeta}`}>{t.bytes ? kb(t.bytes) : "—"}</span>
              </div>
            ))}
          </SeoList>
        )}
      </div>
    </SeoSection>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={classes.stat}>
      <span className={classes.statLabel}>{label}</span>
      <span className={classes.statValue}>{value}</span>
    </div>
  );
}
