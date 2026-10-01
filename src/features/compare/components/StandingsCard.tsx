import type { CSSProperties } from "react";
import { Tooltip, UnstyledButton } from "@mantine/core";
import { ChevronRight, Info } from "lucide-react";
import type { SeoCompetitivePosition } from "@/shared/types";
import classes from "./Compare.module.css";

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function StandingsCard({
  position,
  myScore,
  onSelectCompetitor,
}: {
  position: SeoCompetitivePosition;
  myScore: number;
  onSelectCompetitor: (competitorId: string) => void;
}) {
  const { rank, fieldSize, percentile, leader, gapToLeader, nextUp, closestBehind } = position;
  const leading = rank === 1;
  const tone = leading ? undefined : percentile >= 50 ? "mid" : "low";

  return (
    <section className={classes.banner} data-tone={tone}>
      <div>
        <div className={classes.rank}>
          <span className={classes.rankValue}>{ordinal(rank)}</span>
          <span className={classes.rankOf}>of {fieldSize}</span>
        </div>
        <p className={classes.rankText}>
          {leading ? "You lead the field you are tracking" : `Behind ${leader}, who leads by ${gapToLeader}`}
        </p>
      </div>

      <div className={classes.stat}>
        <span className={classes.eyebrow}>Your score</span>
        <div className={classes.statValue}>{myScore}</div>
      </div>

      <div className={classes.stat}>
        <span className={classes.eyebrow}>
          You beat
          <Tooltip label="The set you track here, not the whole search results page." withArrow multiline w={240}>
            <Info size={11} className={classes.infoIcon} />
          </Tooltip>
        </span>
        <div className={classes.statValue}>{percentile}%</div>
        <div className={classes.statBar}>
          <span className={classes.statFill} style={{ "--share": `${percentile}%` } as CSSProperties} />
        </div>
      </div>

      <div className={classes.moves}>
        {nextUp && (
          <UnstyledButton className={classes.move} onClick={() => onSelectCompetitor(nextUp.competitorId)}>
            <span>
              <span className={classes.moveGap}>
                {nextUp.gap} {nextUp.gap === 1 ? "point" : "points"}
              </span>{" "}
              from passing <b>{nextUp.label}</b>
            </span>
            <ChevronRight size={14} className={classes.moveIcon} />
          </UnstyledButton>
        )}
        {closestBehind && (
          <UnstyledButton className={classes.move} onClick={() => onSelectCompetitor(closestBehind.competitorId)}>
            <span>
              <b>{closestBehind.label}</b> is {closestBehind.gap} behind you
            </span>
            <ChevronRight size={14} className={classes.moveIcon} />
          </UnstyledButton>
        )}
        {!nextUp && !closestBehind && (
          <span className={classes.move}>Every competitor you track scores level with you.</span>
        )}
      </div>
    </section>
  );
}
