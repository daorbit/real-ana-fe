import { Alert } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { useGetSearchInsightsQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { SearchType } from "@/shared/types";
import { buildActions } from "../insightActions";
import { InsightsSummary } from "./InsightsSummary";
import { InsightActionList } from "./InsightActionList";
import { InsightMovers } from "./InsightMovers";
import { InsightsSkeleton } from "./SearchSkeletons";
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
  const { data, isLoading, error } = useGetSearchInsightsQuery({ workspaceId, siteId, days, type });

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
      <div className={classes.layout}>
        <InsightActionList actions={actions} onOpen={(a) => open(a.dimension, a.target)} />
        <InsightMovers data={data} onOpen={open} />
      </div>
    </div>
  );
}
