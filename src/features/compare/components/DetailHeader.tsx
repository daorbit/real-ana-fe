import { ActionIcon, Tooltip } from "@mantine/core";
import { ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import type { SeoCompareBaseline, SeoCompareSnapshot, SeoCompetitorComparison } from "@/shared/types";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { FreshnessBadge } from "./FreshnessBadge";
import { ProvenanceLine } from "./ProvenanceLine";
import { TrustNotices } from "./TrustNotices";
import { comparisonNotices } from "../lib/trust";
import classes from "./Compare.module.css";

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
  const tone = gap.scoreGap > 0 ? "ahead" : gap.scoreGap < 0 ? "behind" : "level";
  const standing = !readable
    ? "Not compared"
    : gap.scoreGap > 0
      ? `They lead by ${gap.scoreGap}`
      : gap.scoreGap < 0
        ? `You lead by ${Math.abs(gap.scoreGap)}`
        : "Level";

  return (
    <section className={classes.card}>
      <div className={classes.detailTop}>
        <div className={classes.identity}>
          <span className={classes.favicon}>
            <SiteFavicon domain={comparison.url} size={20} />
          </span>
          <div className={classes.identityText}>
            <h2 className={classes.detailName}>{label}</h2>
            <a className={classes.detailUrl} href={comparison.url} target="_blank" rel="noreferrer">
              <span className={classes.detailUrlText}>{comparison.url}</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        <div className={classes.detailActions}>
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

      <div className={classes.scoreboard}>
        <div className={classes.scoreCell}>
          <span className={classes.scoreLabel}>{label}</span>
          <div className={classes.scoreValue}>{readable ? snapshot.score : "—"}</div>
        </div>
        <div className={classes.scoreCell}>
          <span className={classes.scoreLabel}>Your page</span>
          <div className={classes.scoreValue} data-you>
            {mine.score}
          </div>
        </div>
        <div className={classes.scoreCell}>
          <span className={classes.scoreLabel}>Standing</span>
          <div className={classes.standing} data-tone={readable ? tone : "level"}>
            {standing}
          </div>
        </div>
      </div>

      <ProvenanceLine baseline={baseline} comparison={comparison} />

      <TrustNotices notices={comparisonNotices(comparison, mine, baseline)} />
    </section>
  );
}
