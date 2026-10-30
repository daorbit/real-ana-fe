import { useState } from "react";
import { Button, Select, Skeleton, Stack } from "@mantine/core";
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
import { weekLabel } from "../lib/insight";
import { InsightsHero } from "../components/InsightsHero";
import { InsightSections } from "../components/InsightSections";

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

  const weeks = overview?.history ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Insights"
        description="What changed on your sites this week, and why it matters."
        docsPath={DOCS_SLUGS.quantalogInsights}
        actions={
          on && overview ? (
            <>
              {weeks.length > 1 && (
                <Select
                  size="sm"
                  w={210}
                  allowDeselect={false}
                  value={picked ?? latestId}
                  onChange={(v) => setWeekId(v)}
                  data={weeks.map((w) => ({ value: w.id, label: `Week of ${weekLabel(w.weekStart)}` }))}
                  aria-label="Week"
                />
              )}
              {canEdit && overview.canRefresh && (
                <Button variant="default" leftSection={<RefreshCw size={15} />} loading={refreshing} onClick={() => void runRefresh()}>
                  Refresh
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      {!active ? null : !on ? (
        <QuantalogAppGate app="insights" />
      ) : (isLoading && !demo) || (picked && olderLoading && !older) ? (
        <Stack gap="lg">
          <Skeleton height={150} radius="lg" />
          <Skeleton height={260} radius="lg" />
        </Stack>
      ) : !digest ? (
        <EmptyState
          icon={ScanSearch}
          title="Your first insights are on the way"
          description="Insights compare each week with the one before. Check back in a few minutes, or on Monday for the next full week."
        />
      ) : (
        <>
          <InsightsHero digest={digest} />
          <InsightSections insights={digest.insights} canTask={tasksOn && canEdit} busyId={busyId} onTask={(i) => void toTask(i)} />
        </>
      )}
    </AppShell>
  );
}
