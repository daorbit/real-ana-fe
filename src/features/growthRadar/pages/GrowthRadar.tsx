import { Button, Skeleton, Stack, Tooltip } from "@mantine/core";
import { RotateCw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { PageTabs } from "@/shared/ui/PageTabs";
import { pageTabId, pageTabPanelId } from "@/shared/ui/pageTabIds";
import { ErrorState } from "@/shared/ui/ErrorState";
import { SaveBarProvider } from "@/shared/ui/SaveBar";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useRadarOverview } from "../hooks/useRadarData";
import { useRadarScan } from "../hooks/useRadarScan";
import { OverviewTab } from "../components/OverviewTab";
import { OpportunitiesTab } from "../components/OpportunitiesTab";
import { HistoryTab } from "../components/HistoryTab";
import { SettingsTab } from "../components/SettingsTab";

type Tab = "overview" | "opportunities" | "history" | "settings";

const TABS_ID = "growth-radar";
const TAB_IDS: Tab[] = ["overview", "opportunities", "history", "settings"];

function tabOf(value: string | null): Tab {
  return TAB_IDS.includes(value as Tab) ? (value as Tab) : "overview";
}

export default function GrowthRadar() {
  useTitle("Growth Radar");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { growthRadar: on } = useWorkspaceApps();
  const workspaceId = active?._id ?? "";
  const [params, setParams] = useSearchParams();
  const tab = tabOf(params.get("tab"));

  const { overview, loading, failed, refetch } = useRadarOverview(workspaceId, on);
  const { run, scanning } = useRadarScan(workspaceId);

  const select = (next: Tab) => setParams(next === "overview" ? {} : { tab: next }, { replace: true });

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "opportunities" as const, label: "Opportunities", count: overview?.counts.active },
    { id: "history" as const, label: "History" },
    { id: "settings" as const, label: "Settings" },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Growth Radar"
        description="What deserves attention, why it matters, and whether the fix helped."
        docsPath={DOCS_SLUGS.quantalogGrowthRadar}
        actions={
          on && canEdit && overview?.canRescan ? (
            <Tooltip label="Read your data and run every check now. Up to 3 times an hour." multiline w={240} withArrow>
              <Button variant="default" leftSection={<RotateCw size={15} />} loading={scanning} onClick={() => void run()}>
                Check now
              </Button>
            </Tooltip>
          ) : undefined
        }
      />

      {!active ? null : !on ? (
        <QuantalogAppGate app="growthRadar" />
      ) : failed ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : loading || !overview ? (
        <Stack gap="lg" mt="xl">
          <Skeleton height={120} radius="md" />
          <Skeleton height={280} radius="md" />
          <Skeleton height={160} radius="md" />
        </Stack>
      ) : (
        <>
          <PageTabs items={tabs} active={tab} onChange={select} label="Growth Radar" idPrefix={TABS_ID} />
          <div role="tabpanel" id={pageTabPanelId(TABS_ID, tab)} aria-labelledby={pageTabId(TABS_ID, tab)}>
            {tab === "overview" && (
              <OverviewTab overview={overview} onSeeAll={() => select("opportunities")} onSettings={() => select("settings")} />
            )}
            {tab === "opportunities" && (
              <OpportunitiesTab workspaceId={workspaceId} cards={overview.opportunities} snoozedCount={overview.counts.snoozed} />
            )}
            {tab === "history" && <HistoryTab workspaceId={workspaceId} historyDays={overview.historyDays} />}
            {tab === "settings" && (
              <SaveBarProvider>
                <SettingsTab workspaceId={workspaceId} canEdit={canEdit} />
              </SaveBarProvider>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
