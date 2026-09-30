import { Alert } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { useGetSearchInsightsQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { SearchType } from "@/shared/types";
import { buildActions } from "../insightActions";
import { InsightsSummary } from "./InsightsSummary";
import { InsightActionList } from "./InsightActionList";
import { InsightMovers } from "./InsightMovers";
import { InsightPositionBands } from "./InsightPositionBands";
import { InsightQuestions } from "./InsightQuestions";
import { InsightsSkeleton } from "./SearchSkeletons";
import { SearchLockedFeature, SearchUpgradeNote } from "./SearchUpgradeNote";
import { useSearchEntitlements } from "../useSearchEntitlements";
import classes from "./insights.module.css";

export function SearchInsightsTab({
  workspaceId,
  siteId,
  days,
  type,
  onOpenQuery,
  onOpenPage,
}: {
  workspaceId: string;
  siteId: string;
  days: number;
  type: SearchType;
  onOpenQuery: (query: string) => void;
  onOpenPage: (url: string) => void;
}) {
  const ent = useSearchEntitlements();
  const locked = ent.insights === "none";
  const { data, isLoading, error } = useGetSearchInsightsQuery(
    { workspaceId, siteId, days, type },
    { skip: locked },
  );

  if (locked) {
    return (
      <SearchLockedFeature
        title="See what to fix first"
        description="Search insights turn your Google data into a ranked to-do list: quick wins close to page 1, pages losing clicks, and queries with weak click-through. Included from the Starter plan."
        preview={<InsightsSkeleton />}
      />
    );
  }

  if (isLoading) return <InsightsSkeleton />;
  if (error && !data) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Insights could not be loaded.")}
      </Alert>
    );
  }
  if (!data) return null;

  const actions = buildActions(data);
  const open = (dimension: "query" | "page", key: string) =>
    dimension === "page" ? onOpenPage(key) : onOpenQuery(key);

  return (
    <div className={classes.root}>
      <InsightsSummary actions={actions} days={days} queries={data.counts.queries} pages={data.counts.pages} />
      {data.limited && (
        <SearchUpgradeNote>
          The {ent.planName} plan shows the top 5 items in each insight. Upgrade to Pro to see every action and mover.
        </SearchUpgradeNote>
      )}
      <InsightPositionBands bands={data.positionBands} />
      <div className={classes.layout}>
        <InsightActionList actions={actions} onOpen={(a) => open(a.dimension, a.target)} />
        <div className={classes.side}>
          <InsightMovers data={data} onOpen={open} />
          <InsightQuestions rows={data.questionQueries} total={data.counts.questionQueries} onOpen={onOpenQuery} />
        </div>
      </div>
    </div>
  );
}
