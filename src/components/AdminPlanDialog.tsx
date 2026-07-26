import {
  Modal, Center, Loader, Stack, ThemeIcon, Text, Group, Badge, Divider, Progress,
} from "@mantine/core";
import { CreditCard } from "lucide-react";
import { useGetAdminUserBillingQuery } from "../store";
import { shortDate } from "../utils";
import type { AdminUser } from "../types";

/** Plan detail dialog for one account — fetched lazily, only while open. */
export function AdminPlanDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const { data, isLoading } = useGetAdminUserBillingQuery(user?.id ?? "", { skip: !user });

  return (
    <Modal
      opened={Boolean(user)}
      onClose={onClose}
      title={user ? `Plan — ${user.name}` : "Plan"}
      radius="md"
      size="sm"
      centered
    >
      {isLoading ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : !data?.subscribed ? (
        <Center py="lg">
          <Stack align="center" gap={6}>
            <ThemeIcon variant="light" color="gray" size="xl" radius="md">
              <CreditCard size={20} />
            </ThemeIcon>
            <Text fw={600} size="sm">No subscription</Text>
            <Text c="dimmed" size="xs" ta="center">
              This account has no plan row at all — it predates billing, or the
              migration hasn&apos;t reached it yet.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Text fw={650}>{data.plan.name}</Text>
              <Text size="xs" c="dimmed" tt="capitalize">{data.cycle} billing</Text>
            </div>
            <Badge
              size="sm"
              variant="light"
              color={data.status === "expired" ? "red" : "emerald"}
              tt="capitalize"
            >
              {data.status}
            </Badge>
          </Group>

          <Text size="xs" c="dimmed">
            {data.status === "expired" ? "Expired" : "Renews"}{" "}
            {data.currentPeriodEnd ? shortDate(data.currentPeriodEnd) : "—"}
          </Text>

          <Divider />

          <UsageRow label="SEO audits" used={data.audits.used} quota={data.audits.planQuota} credits={data.audits.addonCredits} />
          <UsageRow label="Crawls" used={data.crawls.used} quota={data.crawls.planQuota} credits={data.crawls.addonCredits} />
          <UsageRow label="Workspaces" used={data.workspaces.used} quota={data.workspaces.quota} />

          <Text size="xs" c="dimmed">
            {data.maxSitesPerWorkspace} sites per workspace · ranges: {data.allowedRanges.join(", ")}
          </Text>
        </Stack>
      )}
    </Modal>
  );
}

function UsageRow({
  label, used, quota, credits,
}: { label: string; used: number; quota: number; credits?: number }) {
  const total = quota + (credits ?? 0);
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 100;
  return (
    <div>
      <Group justify="space-between" mb={4}>
        <Text size="sm">{label}</Text>
        <Text size="sm" c="dimmed">{used} / {total}</Text>
      </Group>
      <Progress value={pct} size={4} radius="xl" color={pct >= 100 ? "red" : "emerald"} />
    </div>
  );
}
