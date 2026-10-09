import type { ReactNode } from "react";
import { Progress, Tooltip, UnstyledButton } from "@mantine/core";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Info, type LucideIcon } from "lucide-react";
import type { SeoCompetitivePosition } from "@/shared/types";
import { ordinal, points } from "../lib/board";
import classes from "./Standings.module.css";

function Stat({ label, value, share, hint }: { label: string; value: ReactNode; share: number; hint?: string }) {
  return (
    <div className={classes.stat}>
      <span className={classes.statLabel}>
        {label}
        {hint && (
          <Tooltip label={hint} withArrow multiline w={240}>
            <Info size={11} className={classes.hint} />
          </Tooltip>
        )}
      </span>
      <span className={classes.statValue}>{value}</span>
      <Progress value={share} size={5} radius="xl" classNames={{ root: classes.track, section: classes.fill }} />
    </div>
  );
}

function Move({
  icon: Icon,
  tone,
  onClick,
  children,
}: {
  icon: LucideIcon;
  tone: "up" | "down";
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <UnstyledButton className={classes.move} onClick={onClick}>
      <span className={classes.moveIcon} data-tone={tone}>
        <Icon size={14} />
      </span>
      <span className={classes.moveText}>{children}</span>
      <ChevronRight size={14} className={classes.chevron} />
    </UnstyledButton>
  );
}

export function StandingsCard({
  position,
  myScore,
  unread,
  onSelectCompetitor,
}: {
  position: SeoCompetitivePosition;
  myScore: number;
  unread: number;
  onSelectCompetitor: (competitorId: string) => void;
}) {
  const { rank, fieldSize, percentile, leader, gapToLeader, nextUp, closestBehind } = position;
  const leading = rank === 1;
  const tone = leading ? "teal" : percentile >= 50 ? "amber" : "rose";

  return (
    <section className={`${classes.card} tone-tile`} data-tone={tone}>
      <span className={classes.eyebrow}>Your standing</span>

      <div className={classes.rank}>
        <span className={classes.rankValue}>{ordinal(rank)}</span>
        <span className={classes.rankOf}>of {fieldSize}</span>
      </div>
      <p className={classes.rankText}>
        {leading ? "You lead every competitor you track." : `${leader} leads you by ${points(gapToLeader)}.`}
      </p>
      {unread > 0 && (
        <p className={classes.rankNote}>
          {unread} {unread === 1 ? "page" : "pages"} could not be read and {unread === 1 ? "is" : "are"} not ranked.
        </p>
      )}

      <div className={classes.stats}>
        <Stat label="Your score" value={myScore} share={myScore} />
        <Stat
          label="You beat"
          value={`${percentile}%`}
          share={percentile}
          hint="Of the competitors you track here, not the whole search results page."
        />
      </div>

      {(nextUp || closestBehind) && (
        <div className={classes.moves}>
          {nextUp && (
            <Move icon={ArrowUpRight} tone="up" onClick={() => onSelectCompetitor(nextUp.competitorId)}>
              <b>{points(nextUp.gap)}</b> to pass {nextUp.label}
            </Move>
          )}
          {closestBehind && (
            <Move icon={ArrowDownRight} tone="down" onClick={() => onSelectCompetitor(closestBehind.competitorId)}>
              {closestBehind.label} trails by <b>{closestBehind.gap}</b>
            </Move>
          )}
        </div>
      )}
    </section>
  );
}
