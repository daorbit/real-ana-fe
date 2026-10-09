import { useState } from "react";
import type { SeoCompareBaseline, SeoCompareSnapshot, SeoCompetitorComparison } from "@/shared/types";
import { CompetitorBriefCard } from "./CompetitorBriefCard";
import { DetailHeader } from "./DetailHeader";
import { DetailSections, type SectionId, type SectionItem } from "./DetailSections";
import { GapChips } from "./GapChips";
import { ChecksTable } from "./ChecksTable";
import { SerpPreview } from "./SerpPreview";
import { UnreadableCard } from "./UnreadableCard";
import { gapItemCount } from "../lib/board";
import classes from "./Compare.module.css";

function sectionsFor(comparison: SeoCompetitorComparison): SectionItem[] {
  const { gap } = comparison;
  const losing = gap.metrics.filter((m) => m.verdict === "lose").length;
  const gaps = gapItemCount(gap);
  const items: SectionItem[] = [];
  if (gap.recommendations.length > 0) items.push({ id: "plan", label: "Action plan", count: gap.recommendations.length });
  items.push({ id: "checks", label: "Checks", count: losing, alarm: true });
  if (gaps > 0) items.push({ id: "gaps", label: "Content gaps", count: gaps });
  items.push({ id: "serp", label: "Search preview" });
  return items;
}

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
  const [picked, setPicked] = useState<SectionId>("plan");
  const { gap, label } = comparison;
  const items = sectionsFor(comparison);
  const section = items.some((i) => i.id === picked) ? picked : items[0].id;

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
          <DetailSections items={items} value={section} onChange={setPicked} />

          {gap.recommendations.length > 0 && (
            <div hidden={section !== "plan"}>
              <CompetitorBriefCard
                workspaceId={workspaceId}
                siteId={siteId}
                competitorId={comparison.competitorId}
                label={label}
                recommendations={gap.recommendations}
                briefAvailable={briefAvailable && Boolean(comparison.lastCheckedAt)}
              />
            </div>
          )}
          <div hidden={section !== "checks"}>
            <ChecksTable metrics={gap.metrics} label={label} />
          </div>
          <div hidden={section !== "gaps"}>
            <GapChips gap={gap} />
          </div>
          <div hidden={section !== "serp"}>
            <SerpPreview mine={mine} theirs={comparison.snapshot} label={label} />
          </div>
        </>
      )}
    </div>
  );
}
