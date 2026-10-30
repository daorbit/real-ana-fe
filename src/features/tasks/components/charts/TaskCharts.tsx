import { useMemo } from "react";
import type { WorkspaceMember } from "@/shared/types";
import { bucketKeyOf, PRIORITY_LABEL, PRIORITY_ORDER, UNASSIGNED } from "../../lib/board";
import { breakdown, countStates } from "../../lib/charts";
import type { Bucket, Task } from "../../types";
import { ChartCard, SeriesLegend } from "./ChartParts";
import { StackedBars } from "./StackedBars";
import { StatusDonut } from "./StatusDonut";
import { ShippedRecap } from "../recap/ShippedRecap";
import classes from "./Charts.module.css";

export function TaskCharts({
  tasks,
  buckets,
  members,
  memberMap,
}: {
  tasks: Task[];
  buckets: Bucket[];
  members: WorkspaceMember[];
  memberMap: Map<string, WorkspaceMember>;
}) {
  const counts = useMemo(() => countStates(tasks), [tasks]);

  const byPriority = useMemo(
    () => breakdown(tasks, PRIORITY_ORDER.map((p) => ({ key: p, name: PRIORITY_LABEL[p] })), (t) => t.priority),
    [tasks],
  );
  const byBucket = useMemo(
    () => breakdown(tasks, buckets.map((b) => ({ key: b.id, name: b.name })), (t) => bucketKeyOf(t, buckets)),
    [tasks, buckets],
  );
  const byMember = useMemo(
    () =>
      breakdown(
        tasks,
        [...members.map((m) => ({ key: m.userId, name: m.name || m.email })), { key: UNASSIGNED, name: "Unassigned" }],
        (task) => task.assigneeIds.length ? task.assigneeIds : [UNASSIGNED],
      ),
    [tasks, members],
  );

  return (
    <div className={classes.grid}>
      <ChartCard title="This week" wide>
        <ShippedRecap tasks={tasks} memberMap={memberMap} />
      </ChartCard>
      <ChartCard title="Status">
        <StatusDonut counts={counts} />
        <SeriesLegend counts={counts} />
      </ChartCard>
      <ChartCard title="Priority">
        <StackedBars rows={byPriority} />
        <SeriesLegend counts={counts} />
      </ChartCard>
      <ChartCard title="Bucket">
        <StackedBars rows={byBucket} />
        <SeriesLegend counts={counts} />
      </ChartCard>
      <ChartCard title="Members" wide>
        <StackedBars rows={byMember} wide />
        <SeriesLegend counts={counts} />
      </ChartCard>
    </div>
  );
}
