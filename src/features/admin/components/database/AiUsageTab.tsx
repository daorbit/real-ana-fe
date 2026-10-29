import type { Ref } from "react";
import { Center, Loader, Stack } from "@mantine/core";
import { Cpu } from "lucide-react";
import type { WorkersAiUsage } from "@/shared/types";
import { EmptyState } from "@/shared/ui/EmptyState";
import { WorkersAiTrendCard, type WorkersAiTrendCardHandle } from "./WorkersAiTrendCard";
import { WorkersAiCard } from "./WorkersAiCard";
import { SubHeading } from "./shared";

export function AiUsageTab({
  accounts,
  trendRef,
}: {
  accounts: WorkersAiUsage[] | undefined;
  trendRef: Ref<WorkersAiTrendCardHandle>;
}) {
  if (!accounts) {
    return <Center py={64}><Loader size="sm" /></Center>;
  }

  if (accounts.length === 0) {
    return (
      <EmptyState
        compact
        icon={Cpu}
        title="No Cloudflare account connected"
        description="Set the Workers AI account variables on the server to see usage here."
      />
    );
  }

  return (
    <Stack gap="md">
      <SubHeading title="AI usage" text="Workers AI requests across the connected Cloudflare accounts." />
      <WorkersAiTrendCard ref={trendRef} />
      <WorkersAiCard accounts={accounts} />
    </Stack>
  );
}
