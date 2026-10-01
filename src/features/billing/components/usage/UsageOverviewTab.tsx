import { Alert } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { useGetWorkspaceUsageHistoryQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { QuotaSummary } from "@/shared/types";
import { ThisMonthCard } from "./ThisMonthCard";
import { AllowanceList } from "./AllowanceList";
import { UsageTabSkeleton } from "./UsageTabSkeleton";
import { MonthlyEventsChart } from "./MonthlyEventsChart";
import { MonthlyUsageTable } from "./MonthlyUsageTable";
import { PlanTimeline } from "./PlanTimeline";
import classes from "./UsageOverview.module.css";

export function UsageOverviewTab({ workspaceId, usage }: { workspaceId: string; usage: QuotaSummary }) {
  const { data, isLoading, error } = useGetWorkspaceUsageHistoryQuery(workspaceId, {
    skip: !workspaceId,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) return <UsageTabSkeleton />;

  if (error || !data) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Usage history could not be loaded.")}
      </Alert>
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
