import { Progress, UnstyledButton } from "@mantine/core";
import type { SeoCompetitorComparison } from "@/shared/types";
import { standingText, toneOf } from "../../lib/board";
import classes from "./Trend.module.css";

export function TodayStanding({
  competitors,
  palette,
  you,
  myScore,
  selectedId,
  onSelect,
}: {
  competitors: SeoCompetitorComparison[];
  palette: string[];
  you: string;
  myScore: number;
  selectedId: string | null;
  onSelect: (competitorId: string) => void;
}) {
  const ranked = [...competitors].sort((a, b) => b.snapshot.score - a.snapshot.score);

  return (
    <div className={classes.bars}>
      <div className={classes.bar} data-you>
        <div className={classes.barHead}>
          <span className={classes.barName}>Your page</span>
          <span className={classes.barScore}>{myScore}</span>
        </div>
        <Progress value={myScore} size={8} radius="xl" color={you} classNames={{ root: classes.track }} />
      </div>

      {ranked.map((c) => (
        <UnstyledButton
          key={c.competitorId}
          className={classes.bar}
          data-active={c.competitorId === selectedId || undefined}
          onClick={() => onSelect(c.competitorId)}
        >
          <div className={classes.barHead}>
            <span className={classes.barName}>{c.label}</span>
            <span className={classes.barStatus} data-tone={toneOf(c)}>
              {standingText(c)}
            </span>
            <span className={classes.barScore}>{c.snapshot.score}</span>
          </div>
          <Progress
            value={c.snapshot.score}
            size={8}
            radius="xl"
            color={palette[competitors.indexOf(c)]}
            classNames={{ root: classes.track }}
          />
        </UnstyledButton>
      ))}
    </div>
  );
}
