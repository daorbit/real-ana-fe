import type { ReactNode } from "react";
import { UnstyledButton } from "@mantine/core";
import type { SeoCompetitorComparison } from "@/shared/types";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { buildBoard, standingText, toneOf } from "../lib/board";
import classes from "./Rail.module.css";

export function CompetitorRail({
  competitors,
  selectedId,
  onSelect,
  myScore,
  myDomain,
  myFramework,
  count,
  max,
  addForm,
}: {
  competitors: SeoCompetitorComparison[];
  selectedId: string | null;
  onSelect: (competitorId: string) => void;
  myScore: number;
  myDomain: string;
  myFramework?: string;
  count: number;
  max: number;
  addForm?: ReactNode;
}) {
  const rows = buildBoard(competitors, myScore);

  return (
    <div className={`${classes.panel} glass`}>
      <div className={classes.head}>
        <h3 className={classes.title}>Leaderboard</h3>
        <span className={classes.count}>
          {count} / {max} tracked
        </span>
      </div>

      {addForm && <div className={classes.add}>{addForm}</div>}

      <ol className={classes.list}>
        {rows.map((row) => {
          if (row.kind === "you") {
            return (
              <li key="you" className={classes.row} data-you>
                <span className={classes.rank}>{row.rank}</span>
                <SiteFavicon domain={myDomain} framework={myFramework} size={18} />
                <div className={classes.text}>
                  <div className={classes.name}>{myDomain}</div>
                  <div className={classes.status} data-tone="you">
                    Your page
                  </div>
                </div>
                <span className={classes.score}>{row.score}</span>
              </li>
            );
          }

          const c = row.comparison;
          return (
            <li key={c.competitorId}>
              <UnstyledButton
                className={classes.row}
                data-active={c.competitorId === selectedId || undefined}
                onClick={() => onSelect(c.competitorId)}
              >
                <span className={classes.rank}>{row.rank ?? "–"}</span>
                <SiteFavicon domain={c.url} size={18} />
                <div className={classes.text}>
                  <div className={classes.name}>{c.label}</div>
                  <div className={classes.status} data-tone={toneOf(c)}>
                    {standingText(c)}
                  </div>
                </div>
                <span className={classes.score}>{c.readIssue ? "—" : c.snapshot.score}</span>
              </UnstyledButton>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
