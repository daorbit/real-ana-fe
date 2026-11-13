import { ChevronRight, CircleCheck } from "lucide-react";
import { PRIORITY_GROUP_HELP } from "../lib/help";
import type { RadarOverview } from "../types";
import { RadarHero } from "./RadarHero";
import { OpportunityGroup } from "./OpportunityRow";
import { SectionHeader } from "./SectionHeader";
import { SourceList } from "./SourceList";
import { CheckList } from "./CheckList";
import { HowItWorks } from "./HowItWorks";
import classes from "./GrowthRadar.module.css";
import rows from "./Rows.module.css";

const TOP_SHOWN = 5;

function AllClear() {
  return (
    <div className={rows.group}>
      <div className={rows.row}>
        <CircleCheck size={20} className={rows.goodIcon} aria-hidden />
        <span className={rows.main}>
          <span className={rows.listTitle}>All clear</span>
          <span className={rows.subtitle}>Nothing crossed a threshold in the latest check. Growth Radar looks again every morning.</span>
        </span>
      </div>
    </div>
  );
}

export function OverviewTab({
  overview,
  onSeeAll,
  onSettings,
}: {
  overview: RadarOverview;
  onSeeAll: () => void;
  onSettings: () => void;
}) {
  const top = overview.opportunities.slice(0, TOP_SHOWN);
  const scan = overview.lastScan;
  const more = overview.opportunities.length > TOP_SHOWN;

  return (
    <div className={classes.page}>
      <RadarHero overview={overview} />

      <section className={classes.section}>
        <SectionHeader
          title="Deserves attention"
          help={PRIORITY_GROUP_HELP}
          aside={
            more ? (
              <button type="button" className={classes.seeAll} onClick={onSeeAll}>
                See all {overview.opportunities.length}
                <ChevronRight size={15} />
              </button>
            ) : undefined
          }
        />
        {top.length ? <OpportunityGroup cards={top} /> : <AllClear />}
      </section>

      {scan && (
        <div className={classes.split}>
          <SourceList sources={scan.sources} />
          <CheckList runs={scan.detectors} onSettings={onSettings} />
        </div>
      )}

      <HowItWorks />
    </div>
  );
}
