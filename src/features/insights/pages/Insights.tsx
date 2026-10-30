import { useState } from "react";
import { Button, Skeleton, Stack } from "@mantine/core";
import { RefreshCw, ScanSearch } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { notify, notifyError } from "@/shared/lib/notify";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useDemo } from "@/features/demo/context";
import { demoInsights } from "@/features/demo/demoInsights";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useGetInsightDigestQuery, useGetInsightsQuery, useRefreshInsightsMutation } from "../api";
import { useInsightTask } from "../hooks/useInsightTask";
import { WeeklySummary } from "../components/WeeklySummary";
import { HighlightList } from "../components/HighlightList";
import classes from "../components/Insights.module.css";

export default function Insights() {
  useTitle("Insights");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { insights: on, tasks: tasksOn } = useWorkspaceApps();
  const { demo } = useDemo();
  const workspaceId = active?._id ?? "";

  const [weekId, setWeekId] = useState<string | null>(null);
  const { currentData, isLoading } = useGetInsightsQuery(workspaceId, { skip: !workspaceId || !on || demo });
  const overview = demo ? demoInsights : currentData;
  const latestId = overview?.digest?.id ?? null;
  const picked = weekId && weekId !== latestId ? weekId : null;
  const { currentData: older, isFetching: olderLoading } = useGetInsightDigestQuery(
    { workspaceId, id: picked ?? "" },
    { skip: !picked || demo },
  );
  const digest = picked ? older : overview?.digest ?? null;

  const weeks = overview?.history ?? [];
  const index = weeks.findIndex((w) => w.id === (picked ?? latestId));
  const olderWeek = index >= 0 ? weeks[index + 1] : undefined;
  const newerWeek = index > 0 ? weeks[index - 1] : undefined;

  const [refresh, { isLoading: refreshing }] = useRefreshInsightsMutation();
  const { toTask, busyId } = useInsightTask(workspaceId, demo);

  const runRefresh = async () => {
    if (demo) return notify.error("Turn off demo data to refresh insights.");
    try {
      await refresh(workspaceId).unwrap();
      setWeekId(null);
      notify.success("Insights updated");
    } catch (e) {
      notifyError(e, "Could not refresh insights");
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Insights"
        description="What changed on your sites this week, and why it matters."
        docsPath={DOCS_SLUGS.quantalogInsights}
        actions={
          on && canEdit && overview?.canRefresh ? (
            <Button variant="default" leftSection={<RefreshCw size={15} />} loading={refreshing} onClick={() => void runRefresh()}>
              Refresh
            </Button>
          ) : undefined
        }
      />

      {!active ? null : !on ? (
        <QuantalogAppGate app="insights" />
      ) : (isLoading && !demo) || (picked && olderLoading && !older) ? (
        <Stack gap="lg" className={classes.page}>
          <Skeleton height={230} radius={22} />
          <Skeleton height={300} radius={20} />
        </Stack>
      ) : !digest ? (
        <EmptyState
          icon={ScanSearch}
          title="Your first insights are on the way"
          description="Insights compare each week with the one before. Check back in a few minutes, or on Monday for the next full week."
        />
      ) : (
        <div className={classes.page}>
          <WeeklySummary
            digest={digest}
            onOlder={olderWeek ? () => setWeekId(olderWeek.id) : null}
            onNewer={newerWeek ? () => setWeekId(newerWeek.id) : null}
          />
          <HighlightList
            key={digest.id}
            insights={digest.insights}
            canTask={tasksOn && canEdit}
            busyId={busyId}
            onTask={(i) => void toTask(i)}
          />
        </div>
      )}
    </AppShell>
  );
}
