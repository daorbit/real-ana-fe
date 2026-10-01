import type { SeoCompetitorComparison } from "@/shared/types";
import { CompetitorBriefCard } from "./CompetitorBriefCard";
import { DetailHeader } from "./DetailHeader";
import { GapChips } from "./GapChips";
import { ChecksTable } from "./ChecksTable";
import classes from "./Compare.module.css";

export function CompetitorDetail({
  comparison,
  myAuditedAt,
  workspaceId,
  siteId,
  briefAvailable,
  canEdit,
  refreshing,
  onRefresh,
  onDelete,
}: {
  comparison: SeoCompetitorComparison;
  myAuditedAt: string | null;
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
        myAuditedAt={myAuditedAt}
        canEdit={canEdit}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onDelete={onDelete}
      />

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

      <GapChips gap={gap} />

      <ChecksTable metrics={gap.metrics} label={label} />
    </div>
  );
}
