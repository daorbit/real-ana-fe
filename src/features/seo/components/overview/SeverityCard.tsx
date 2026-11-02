import { Text } from "@mantine/core";
import type { IssueBreakdown } from "@/features/seo/components/hooks";
import { SeoCard } from "@/features/seo/components/shared/SeoCard";
import { severityHex } from "@/features/seo/components/utils";
import classes from "./overviewCards.module.css";

const SIZE = 112;
const THICKNESS = 12;
const GAP = 3;

const LEGEND = [
  { sev: "critical", label: "Critical" },
  { sev: "warning", label: "Warnings" },
  { sev: "info", label: "Suggestions" },
] as const;

export function SeverityCard({ breakdown }: { breakdown: IssueBreakdown }) {
  const r = (SIZE - THICKNESS) / 2;
  const circ = 2 * Math.PI * r;
  const { total } = breakdown;
  let offset = 0;

  const arcs = LEGEND.filter((l) => breakdown[l.sev] > 0).map((l) => {
    const length = (circ * breakdown[l.sev]) / total;
    const arc = { sev: l.sev, dash: `${Math.max(0, length - GAP)} ${circ}`, offset: -offset };
    offset += length;
    return arc;
  });

  return (
    <SeoCard className="col-4" title="Issues by severity">
      <div className={classes.donutRow}>
        <div
          className="seo-gauge"
          role="img"
          aria-label={`${breakdown.critical} critical, ${breakdown.warning} warnings, ${breakdown.info} suggestions`}
        >
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" strokeWidth={THICKNESS} className={classes.donutTrack} />
            {arcs.map((a) => (
              <circle
                key={a.sev}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={r}
                fill="none"
                stroke={severityHex(a.sev)}
                strokeWidth={THICKNESS}
                strokeDasharray={a.dash}
                strokeDashoffset={a.offset}
              />
            ))}
          </svg>
          <div>
            <Text className="g-num" fz={26}>{total}</Text>
            <Text className="g-of">{total === 1 ? "issue" : "issues"}</Text>
          </div>
        </div>
        <div className={classes.legend}>
          {LEGEND.map((l) => (
            <div key={l.sev} className={classes.legendRow} data-sev={l.sev}>
              <span className={classes.swatch} aria-hidden />
              <span className={classes.legendLabel}>{l.label}</span>
              <span className={classes.legendValue}>{breakdown[l.sev]}</span>
            </div>
          ))}
        </div>
      </div>
    </SeoCard>
  );
}
