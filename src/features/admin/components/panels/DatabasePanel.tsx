import { useRef } from "react";
import { Center, Loader, Stack, Text } from "@mantine/core";
import { useGetDbStatsQuery } from "@/app/store";
import { StorageTab } from "@/features/admin/components/database/StorageTab";
import { WorkersAiTrendCard, type WorkersAiTrendCardHandle } from "@/features/admin/components/database/WorkersAiTrendCard";
import { WorkersAiCard } from "@/features/admin/components/database/WorkersAiCard";
import { AdminSection } from "../layout/AdminSection";
import { AdminRefreshButton } from "../layout/AdminRefreshButton";

function SubHeading({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <Text fw={650} size="sm">{title}</Text>
      <Text size="xs" c="dimmed" mt={2}>{text}</Text>
    </div>
  );
}

export default function DatabasePanel() {
  const { data, isFetching, refetch } = useGetDbStatsQuery();
  const trendRef = useRef<WorkersAiTrendCardHandle>(null);

  const refresh = () => {
    refetch();
    trendRef.current?.refetch();
  };

  return (
    <AdminSection id="database" actions={<AdminRefreshButton onClick={refresh} loading={isFetching} />}>
      {!data ? (
        <Center py={64}><Loader size="sm" /></Center>
      ) : (
        <Stack gap={40}>
          <Stack gap="md">
            <SubHeading title="Storage" text={`What “${data.name}” is using, and how much room is left on the plan.`} />
            <StorageTab data={data} />
          </Stack>

          {data.workersAi.length > 0 && (
            <Stack gap="md">
              <SubHeading title="AI usage" text="Workers AI requests across the connected Cloudflare accounts." />
              <WorkersAiTrendCard ref={trendRef} />
              <WorkersAiCard accounts={data.workersAi} />
            </Stack>
          )}
        </Stack>
      )}
    </AdminSection>
  );
}
