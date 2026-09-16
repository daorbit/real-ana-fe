import { Button, Center, Loader, Stack, Tabs } from "@mantine/core";
import { RefreshCw } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { useGetDbStatsQuery } from "@/app/store";
import { StorageTab } from "@/features/admin/components/database/StorageTab";
import { WorkersAiTrendCard } from "@/features/admin/components/database/WorkersAiTrendCard";
import { WorkersAiCard } from "@/features/admin/components/database/WorkersAiCard";

export default function AdminDatabase() {
  const { data, isFetching, refetch } = useGetDbStatsQuery();

  const refreshButton = (
    <Button
      variant="default"
      size="sm"
      leftSection={<RefreshCw size={14} />}
      loading={isFetching}
      onClick={() => refetch()}
    >
      Refresh
    </Button>
  );

  if (!data) {
    return (
      <AppShell>
        <PageHeader title="Database" description="Storage the database is using." actions={refreshButton} />
        <Center py={64}><Loader size="sm" /></Center>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Database"
        description={`Storage used by “${data.name}”, and headroom against the plan limit.`}
        actions={refreshButton}
      />

      <Tabs defaultValue="storage" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="storage">Storage</Tabs.Tab>
          {data.workersAi.length > 0 && <Tabs.Tab value="ai">AI usage</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel value="storage">
          <StorageTab data={data} />
        </Tabs.Panel>

        {data.workersAi.length > 0 && (
          <Tabs.Panel value="ai">
            <Stack gap="lg">
              <WorkersAiTrendCard />
              <WorkersAiCard accounts={data.workersAi} />
            </Stack>
          </Tabs.Panel>
        )}
      </Tabs>
    </AppShell>
  );
}
