import { ActionIcon, Tooltip } from "@mantine/core";
import { AlertTriangle, ExternalLink, Info, RefreshCw, Trash2 } from "lucide-react";
import type { SeoCompetitorComparison } from "@/shared/types";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { FreshnessBadge, freshnessOf, STALE_AFTER_DAYS } from "./FreshnessBadge";
import classes from "./Compare.module.css";

const DAY = 24 * 60 * 60 * 1000;

const METHOD_NOTE =
  "Both pages were fetched, parsed and scored by the same formula. On-page signals only — titles, headings, structure and schema — so this differs from your SEO report, which also includes Lighthouse.";

export function DetailHeader({
  comparison,
  myAuditedAt,
  canEdit,
  refreshing,
  onRefresh,
  onDelete,
}: {
  comparison: SeoCompetitorComparison;
  myAuditedAt: string | null;
  canEdit: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onDelete: () => void;
}) {
  const { gap, snapshot, label } = comparison;
  const tone = gap.scoreGap > 0 ? "ahead" : gap.scoreGap < 0 ? "behind" : "level";
  const standing =
    gap.scoreGap > 0
      ? `They lead by ${gap.scoreGap}`
      : gap.scoreGap < 0
        ? `You lead by ${Math.abs(gap.scoreGap)}`
        : "Level";

  const stale = freshnessOf(comparison.lastCheckedAt) === "stale";
  const skewDays =
    myAuditedAt && comparison.lastCheckedAt
      ? Math.abs(new Date(myAuditedAt).getTime() - new Date(comparison.lastCheckedAt).getTime()) / DAY
      : 0;
  const skewed = skewDays > STALE_AFTER_DAYS;

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
              <Tooltip label="Re-fetch this page" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  radius="md"
                  onClick={onRefresh}
                  loading={refreshing}
                  aria-label="Re-fetch this page"
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
          <span className={classes.scoreLabel}>
            {label}
            <Tooltip label={METHOD_NOTE} withArrow multiline w={300}>
              <Info size={12} className={classes.infoIcon} />
            </Tooltip>
          </span>
          <div className={classes.scoreValue}>{snapshot.score}</div>
        </div>
        <div className={classes.scoreCell}>
          <span className={classes.scoreLabel}>Your page</span>
          <div className={classes.scoreValue} data-you>
            {snapshot.score - gap.scoreGap}
          </div>
        </div>
        <div className={classes.scoreCell}>
          <span className={classes.scoreLabel}>Standing</span>
          <div className={classes.standing} data-tone={tone}>
            {standing}
          </div>
        </div>
      </div>

      {(stale || skewed) && (
        <p className={classes.notice}>
          <AlertTriangle size={14} />
          {skewed
            ? `Your audit and this snapshot were taken ${Math.round(skewDays)} days apart. Refresh both for a comparison of what is live now.`
            : "This snapshot is over a week old. Their page may have changed since it was taken."}
        </p>
      )}
    </section>
  );
}
