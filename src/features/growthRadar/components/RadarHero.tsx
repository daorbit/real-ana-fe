import { Radar } from "lucide-react";
import { InfoTip, TipText } from "@/shared/ui/InfoTip";
import { dateTime, timeAgo } from "@/shared/lib/format";
import { SCAN_HELP, TALLY_HELP } from "../lib/help";
import type { RadarOverview } from "../types";
import classes from "./GrowthRadar.module.css";

function headline(active: number, high: number): string {
  if (!active) return "Nothing needs your attention right now";
  const things = `${active} ${active === 1 ? "finding deserves" : "findings deserve"} your attention`;
  return high ? `${things}, ${high} of them high priority` : things;
}

function scanText(overview: RadarOverview): string {
  const scan = overview.lastScan;
  const next = overview.nextScanAt ? `next check ${dateTime(overview.nextScanAt)}` : "";
  if (!scan) return next ? `The first check is running, then ${next}.` : "";
  const last =
    scan.status === "failed"
      ? `The last check, ${timeAgo(scan.startedAt)}, did not finish`
      : scan.status === "partial"
        ? `Checked ${timeAgo(scan.startedAt)} with some sources missing`
        : `Checked ${timeAgo(scan.startedAt)}`;
  return next ? `${last}, ${next}.` : `${last}.`;
}

export function RadarHero({ overview }: { overview: RadarOverview }) {
  const { counts } = overview;
  const tally = [
    { label: "High priority", value: counts.high, help: TALLY_HELP.high },
    { label: "Planned", value: counts.planned, help: TALLY_HELP.planned },
    { label: "Investigating", value: counts.investigating, help: TALLY_HELP.investigating },
    { label: "Resolved in 30 days", value: counts.resolved, help: TALLY_HELP.resolved },
  ];
  const anything = tally.some((t) => t.value > 0);

  return (
    <section className={classes.hero}>
      <div>
        <span className={classes.heroEyebrow}>
          <Radar size={15} />
          Today's radar
        </span>
        <h2 className={classes.heroTitle}>{headline(counts.active, counts.high)}</h2>
        <p className={classes.heroSub}>
          {scanText(overview)}
          <InfoTip label={SCAN_HELP} />
        </p>
      </div>
      {anything && (
        <div className={classes.summaryBar}>
          {tally.map((item) => (
            <div key={item.label} className={classes.summaryCell}>
              <span className={classes.summaryValue}>{item.value}</span>
              <span className={classes.summaryLabel}>
                <TipText label={item.help}>{item.label}</TipText>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
