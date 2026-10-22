import { useGetWorkspaceUsageHistoryQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { QuotaSummary } from "@/shared/types";
import { ThisMonthCard } from "./ThisMonthCard";
import { AllowanceList } from "./AllowanceList";
import { UsageTabSkeleton } from "./UsageTabSkeleton";
import { MonthlyEventsChart } from "./MonthlyEventsChart";
import { MonthlyUsageTable } from "./MonthlyUsageTable";
import { PlanTimeline } from "./PlanTimeline";
import classes from "./UsageOverview.module.css";

export function UsageOverviewTab({ workspaceId, usage }: { workspaceId: string; usage: QuotaSummary }) {
  const { data, isLoading, isFetching, error, refetch } = useGetWorkspaceUsageHistoryQuery(workspaceId, {
    skip: !workspaceId,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) return <UsageTabSkeleton />;

  if (error || !data) {
    return (
      <ErrorState
        compact
        title="Couldn't load usage"
        description={errMessage(error, "Usage history could not be loaded.")}
        onRetry={refetch}
        retrying={isFetching}
      />
    );
  }

  const [current] = data.months;

  return (
    <div className={classes.root}>
      {current && <ThisMonthCard month={current} resetsAt={data.resetsAt} />}
      {usage && <AllowanceList usage={usage} />}
      <MonthlyEventsChart months={data.months} />
      <div className={classes.grid}>
        <MonthlyUsageTable months={data.months} />
        <PlanTimeline plans={data.plans} />
      </div>
    </div>
  );
}
