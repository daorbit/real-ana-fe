import type { SeoCompareBaseline, SeoCompareSnapshot, SeoCompetitorComparison } from "@/shared/types";
import { CompetitorBriefCard } from "./CompetitorBriefCard";
import { DetailHeader } from "./DetailHeader";
import { GapChips } from "./GapChips";
import { ChecksTable } from "./ChecksTable";
import { SerpPreview } from "./SerpPreview";
import { UnreadableCard } from "./UnreadableCard";
import classes from "./Compare.module.css";

export function CompetitorDetail({
  comparison,
  mine,
  baseline,
  workspaceId,
  siteId,
  briefAvailable,
  canEdit,
  refreshing,
  onRefresh,
  onDelete,
}: {
  comparison: SeoCompetitorComparison;
  mine: SeoCompareSnapshot;
  baseline: SeoCompareBaseline;
  workspaceId: string;
  siteId: string;
  briefAvailable: boolean;
  canEdit: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onDelete: () => void;
}) {
  const { gap, label } = comparison;

  return (
    <div className={classes.detail}>
      <DetailHeader
        comparison={comparison}
        mine={mine}
        baseline={baseline}
        canEdit={canEdit}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onDelete={onDelete}
      />

      {comparison.readIssue ? (
        <UnreadableCard comparison={comparison} canEdit={canEdit} refreshing={refreshing} onRefresh={onRefresh} />
      ) : (
        <>
          {gap.recommendations.length > 0 && (
            <CompetitorBriefCard
              workspaceId={workspaceId}
              siteId={siteId}
              competitorId={comparison.competitorId}
              label={label}
              recommendations={gap.recommendations}
              briefAvailable={briefAvailable && Boolean(comparison.lastCheckedAt)}
            />
          )}

          <SerpPreview mine={mine} theirs={comparison.snapshot} label={label} />

          <GapChips gap={gap} />

          <ChecksTable metrics={gap.metrics} label={label} />
        </>
      )}
    </div>
  );
}
