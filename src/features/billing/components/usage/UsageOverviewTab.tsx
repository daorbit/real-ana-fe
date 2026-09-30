import { Alert, Skeleton } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { useGetWorkspaceUsageHistoryQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { ThisMonthCard } from "./ThisMonthCard";
import { MonthlyEventsChart } from "./MonthlyEventsChart";
import { MonthlyUsageTable } from "./MonthlyUsageTable";
import { PlanTimeline } from "./PlanTimeline";
import classes from "./UsageOverview.module.css";

export function UsageOverviewTab({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading, error } = useGetWorkspaceUsageHistoryQuery(workspaceId, {
    skip: !workspaceId,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return (
      <div className={classes.root}>
        <Skeleton height={180} radius="lg" />
        <Skeleton height={300} radius="lg" />
      </div>
    );
  }

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
      <MonthlyEventsChart months={data.months} />
      <div className={classes.grid}>
        <MonthlyUsageTable months={data.months} />
        <PlanTimeline plans={data.plans} />
      </div>
    </div>
  );
}
