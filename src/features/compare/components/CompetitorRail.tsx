import type { ReactNode } from "react";
import { UnstyledButton } from "@mantine/core";
import type { SeoCompetitorComparison } from "@/shared/types";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import classes from "./Compare.module.css";

function standing(scoreGap: number): { tone: string; text: string } {
  if (scoreGap > 0) return { tone: "ahead", text: `${scoreGap} ahead of you` };
  if (scoreGap < 0) return { tone: "behind", text: `${Math.abs(scoreGap)} behind you` };
  return { tone: "level", text: "Level" };
}

export function CompetitorRail({
  competitors,
  selectedId,
  onSelect,
  myScore,
  myDomain,
  myFramework,
  toughestId,
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
  toughestId: string | null;
  count: number;
  max: number;
  addForm?: ReactNode;
}) {
  const ordered = [...competitors].sort((a, b) => b.gap.scoreGap - a.gap.scoreGap);

  return (
    <div className={classes.panel}>
      <div className={classes.railHead}>
        <h3 className={classes.railTitle}>Competitors</h3>
        <span className={classes.railCount}>
          {count} / {max}
        </span>
      </div>

      {addForm && <div className={classes.addForm}>{addForm}</div>}

      <div className={classes.baseline}>
        <SiteFavicon domain={myDomain} framework={myFramework} size={18} />
        <div className={classes.itemText}>
          <div className={classes.itemLabel}>{myDomain}</div>
          <div className={classes.itemStatus} data-tone="you">
            Your page · baseline
          </div>
        </div>
        <span className={classes.itemScore}>{myScore}</span>
      </div>

      <div className={classes.listLabel}>
        <span>Tracked</span>
        <span>Toughest first</span>
      </div>

      <div className={classes.list}>
        {ordered.map((c) => {
          const { tone, text } = standing(c.gap.scoreGap);
          return (
            <UnstyledButton
              key={c.competitorId}
              className={classes.item}
              data-active={c.competitorId === selectedId || undefined}
              onClick={() => onSelect(c.competitorId)}
            >
              <SiteFavicon domain={c.url} size={18} />
              <div className={classes.itemText}>
                <div className={classes.itemLabel}>
                  {c.label}
                  {c.competitorId === toughestId && <span className={classes.toughDot} aria-label="Furthest ahead" />}
                </div>
                <div className={classes.itemStatus} data-tone={tone}>
                  {text}
                </div>
              </div>
              <span className={classes.itemScore}>{c.snapshot.score}</span>
            </UnstyledButton>
          );
        })}
      </div>
    </div>
  );
}
