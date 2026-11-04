import type { CSSProperties } from "react";
import { Repeat } from "lucide-react";
import { compact } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import type { VisitorSplit } from "@/shared/types";
import classes from "./VisitorSplitPanel.module.css";

export function VisitorSplitPanel({ split }: { split?: VisitorSplit | null }) {
  const fresh = split?.new ?? 0;
  const returning = split?.returning ?? 0;
  const total = fresh + returning;
  const freshPct = total > 0 ? Math.round((fresh / total) * 100) : 0;

  return (
    <RankCard title="New and returning" subtitle="Visitors in this period" tone="emerald">
      {total === 0 ? (
        <RankEmpty icon={Repeat}>No visitors in this range yet</RankEmpty>
      ) : (
        <>
          <div className={classes.figures}>
            <div className={classes.figure}>
              <span className={classes.label}>New</span>
              <span className={classes.value}>{freshPct}%</span>
              <span className={classes.count}>{compact(fresh)} visitors</span>
            </div>
            <div className={classes.figure}>
              <span className={classes.label}>Returning</span>
              <span className={classes.value}>{100 - freshPct}%</span>
              <span className={classes.count}>{compact(returning)} visitors</span>
            </div>
          </div>
          <div className={classes.bar} aria-hidden>
            <span className={classes.fresh} style={{ "--share": `${freshPct}%` } as CSSProperties} />
            <span className={classes.returning} />
          </div>
          <p className={classes.note}>A visitor counts as returning when they were also seen before the range started.</p>
        </>
      )}
    </RankCard>
  );
}
