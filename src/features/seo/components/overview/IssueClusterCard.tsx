import { useMemo, type CSSProperties } from "react";
import { Card } from "@mantine/core";
import { Check } from "lucide-react";
import type { SeoIssue } from "@/shared/types";
import { useIssueBreakdown } from "@/features/seo/components/hooks";
import { AREA_LABEL } from "@/features/seo/components/utils";
import classes from "./overviewCards.module.css";

const SEVERITIES: SeoIssue["severity"][] = ["critical", "warning", "info"];

const SEVERITY_NOUN: Record<SeoIssue["severity"], [string, string]> = {
  critical: ["critical", "critical"],
  warning: ["warning", "warnings"],
  info: ["suggestion", "suggestions"],
};

function describeSplit(split: { severity: SeoIssue["severity"]; n: number }[]): string {
  return split.map(({ severity, n }) => `${n} ${SEVERITY_NOUN[severity][n === 1 ? 0 : 1]}`).join(" · ");
}

export function IssueClusterCard({ breakdown }: { breakdown: ReturnType<typeof useIssueBreakdown> }) {
  const rows = useMemo(
    () =>
      breakdown.byArea
        .map(({ area, n }) => {
          const inArea = breakdown.sorted.filter((issue) => issue.area === area);
          return {
            area,
            n,
            split: SEVERITIES.map((severity) => ({
              severity,
              n: inArea.filter((issue) => issue.severity === severity).length,
            })).filter((part) => part.n > 0),
          };
        })
        .sort((a, b) => b.n - a.n),
    [breakdown],
  );
  const max = Math.max(1, ...rows.map((row) => row.n));
  const affected = rows.filter((row) => row.n > 0).length;

  return (
    <Card withBorder radius="md" padding="lg" className={`col-5 seo-panel ${classes.fill}`}>
      <div className={classes.head}>
        <span className={classes.title}>Where issues cluster</span>
        <span className="seo-eyebrow">
          {affected} of {rows.length} areas
        </span>
      </div>

      <div className={classes.clusterList}>
        {rows.map((row) => (
          <div key={row.area} className={classes.area} data-empty={row.n === 0 || undefined}>
            <div className={classes.areaTop}>
              <div className={classes.areaText}>
                <span className={classes.areaName}>{AREA_LABEL[row.area]}</span>
                <span className={classes.areaSub}>
                  {row.n > 0 ? (
                    describeSplit(row.split)
                  ) : (
                    <>
                      <Check size={11} aria-hidden />
                      No issues
                    </>
                  )}
                </span>
              </div>
              <span className={classes.areaCount} data-sev={row.split[0]?.severity}>
                {row.n}
              </span>
            </div>

            {row.n > 0 && (
              <div className={classes.track}>
                <div className={classes.stack} style={{ "--w": `${(row.n / max) * 100}%` } as CSSProperties}>
                  {row.split.map((part) => (
                    <span
                      key={part.severity}
                      className={classes.seg}
                      data-sev={part.severity}
                      style={{ "--n": part.n } as CSSProperties}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
