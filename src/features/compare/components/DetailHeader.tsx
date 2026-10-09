import { ActionIcon, Progress, Tooltip } from "@mantine/core";
import { ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import type { SeoCompareBaseline, SeoCompareSnapshot, SeoCompetitorComparison } from "@/shared/types";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { FreshnessBadge } from "./FreshnessBadge";
import { ProvenanceLine } from "./ProvenanceLine";
import { TrustNotices } from "./TrustNotices";
import { comparisonNotices } from "../lib/trust";
import { toneOf } from "../lib/board";
import classes from "./DetailHeader.module.css";

function verdictText(scoreGap: number, readable: boolean): string {
  if (!readable) return "Not compared";
  if (scoreGap > 0) return `Leads you by ${scoreGap}`;
  if (scoreGap < 0) return `Trails you by ${Math.abs(scoreGap)}`;
  return "Level with you";
}

function ScoreTile({
  label,
  score,
  side,
  tone,
  domain,
}: {
  label: string;
  score: number | null;
  side: "you" | "them";
  tone?: string;
  domain: string;
}) {
  return (
    <div className={classes.tile} data-side={side} data-tone={tone}>
      <div className={classes.tileHead}>
        <SiteFavicon domain={domain} size={14} />
        <span className={classes.tileLabel}>{label}</span>
      </div>
      <div className={classes.tileScore}>
        {score ?? "—"}
        <span className={classes.tileOutOf}>/ 100</span>
      </div>
      <Progress value={score ?? 0} size={5} radius="xl" classNames={{ root: classes.track, section: classes.fill }} />
    </div>
  );
}

export function DetailHeader({
  comparison,
  mine,
  baseline,
  canEdit,
  refreshing,
  onRefresh,
  onDelete,
}: {
  comparison: SeoCompetitorComparison;
  mine: SeoCompareSnapshot;
  baseline: SeoCompareBaseline;
  canEdit: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onDelete: () => void;
}) {
  const { gap, snapshot, label } = comparison;
  const readable = !comparison.readIssue;
  const tone = toneOf(comparison);

  return (
    <section className={`${classes.card} glass`}>
      <div className={classes.top}>
        <div className={classes.identity}>
          <span className={classes.favicon}>
            <SiteFavicon domain={comparison.url} size={20} />
          </span>
          <div className={classes.identityText}>
            <div className={classes.nameRow}>
              <h2 className={classes.name}>{label}</h2>
              <span className={classes.verdict} data-tone={tone}>
                {verdictText(gap.scoreGap, readable)}
              </span>
            </div>
            <a className={classes.url} href={comparison.url} target="_blank" rel="noreferrer">
              <span className={classes.urlText}>{comparison.url}</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        <div className={classes.actions}>
          <FreshnessBadge checkedAt={comparison.lastCheckedAt} />
          {canEdit && (
            <>
              <Tooltip label="Re-fetch their page and yours" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  radius="md"
                  onClick={onRefresh}
                  loading={refreshing}
                  aria-label="Re-fetch both pages"
                >
                  <RefreshCw size={15} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Stop tracking" withArrow>
                <ActionIcon variant="subtle" color="red" radius="md" onClick={onDelete} aria-label="Stop tracking">
                  <Trash2 size={15} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      <div className={classes.tiles}>
        <ScoreTile label="Your page" score={mine.score} side="you" domain={mine.finalUrl || mine.url} />
        <ScoreTile
          label={label}
          score={readable ? snapshot.score : null}
          side="them"
          tone={tone}
          domain={comparison.url}
        />
      </div>

      <ProvenanceLine baseline={baseline} comparison={comparison} />

      <TrustNotices notices={comparisonNotices(comparison, mine, baseline)} />
    </section>
  );
}
