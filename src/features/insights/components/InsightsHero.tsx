import { SECTIONS, weekLabel } from "../lib/insight";
import type { InsightDigest } from "../types";
import classes from "./Insights.module.css";

const FALLBACK = "Here is what moved on your sites this week compared with the week before.";
const QUIET = "A quiet week: nothing moved enough to call out. Your traffic held steady against the week before.";

export function InsightsHero({ digest }: { digest: InsightDigest }) {
  const change =
    digest.previousVisitors > 0
      ? Math.round(((digest.visitors - digest.previousVisitors) / digest.previousVisitors) * 100)
      : null;

  return (
    <section className={classes.hero}>
      <div className={classes.heroMain}>
        <span className={classes.week}>Week of {weekLabel(digest.periodStart, digest.periodEnd)}</span>
        <p className={classes.summary}>{digest.insights.length ? digest.summary || FALLBACK : QUIET}</p>
        {digest.insights.length > 0 && (
          <div className={classes.counts}>
            {SECTIONS.map(({ tone, title }) => {
              const count = digest.insights.filter((i) => i.tone === tone).length;
              return count ? (
                <span key={tone} className={classes.count}>
                  <span className={classes.dot} data-tone={tone} />
                  {count} {title.toLowerCase()}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>
      <div className={classes.kpi}>
        <span className={classes.kpiLabel}>Visitors this week</span>
        <span className={classes.kpiValue}>{digest.visitors.toLocaleString()}</span>
        <span className={classes.kpiSub}>
          {change === null ? "No earlier week to compare" : `${change > 0 ? "+" : ""}${change}% vs last week`}
        </span>
      </div>
    </section>
  );
}
