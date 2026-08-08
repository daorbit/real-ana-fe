import {
  Modal, Center, Loader, Stack, ThemeIcon, Text, Group, Badge, Divider, Progress,
} from "@mantine/core";
import { CreditCard } from "lucide-react";
import { useGetAdminUserBillingQuery } from "@/app/store";
import { shortDate } from "@/shared/lib";
import type { AdminUser } from "@/shared/types";

/**
 * Plan detail dialog for one account — fetched lazily, only while open.
 *
 * One section per workspace, because plans are bought per workspace: an
 * account can be on Pro for one and Free for another, and a single summary
 * would have to pick one and misreport the rest.
 */
export function AdminPlanDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const { data, isLoading } = useGetAdminUserBillingQuery(user?.id ?? "", { skip: !user });

  return (
    <Modal
      opened={Boolean(user)}
      onClose={onClose}
      title={user ? `Plan — ${user.name}` : "Plan"}
      radius="md"
      size="md"
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
              None of this account&apos;s workspaces has a plan row — it owns no
              workspaces yet, or the migration hasn&apos;t reached it.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="lg">
          {data.workspaces.map((ws, i) => (
            <Stack key={ws.workspaceId} gap="md">
              {i > 0 && <Divider />}
              <Group justify="space-between">
                <div>
                  <Text fw={650}>{ws.name}</Text>
                  <Text size="xs" c="dimmed" tt="capitalize">
                    {ws.billing ? `${ws.billing.plan.name} · ${ws.billing.cycle} billing` : "No plan"}
                  </Text>
                </div>
                {ws.billing && (
                  <Badge
                    size="sm"
                    variant="light"
                    color={ws.billing.status === "expired" ? "red" : "emerald"}
                    tt="capitalize"
                  >
                    {ws.billing.status}
                  </Badge>
                )}
              </Group>

              {ws.billing && (
                <>
                  <Text size="xs" c="dimmed">
                    {ws.billing.status === "expired" ? "Expired" : "Renews"}{" "}
                    {ws.billing.currentPeriodEnd ? shortDate(ws.billing.currentPeriodEnd) : "—"}
                  </Text>

                  <UsageRow label="SEO audits" used={ws.billing.audits.used} quota={ws.billing.audits.planQuota} credits={ws.billing.audits.addonCredits} />
                  <UsageRow label="Crawls" used={ws.billing.crawls.used} quota={ws.billing.crawls.planQuota} credits={ws.billing.crawls.addonCredits} />
                  <UsageRow label="Sites" used={ws.billing.sites.used} quota={ws.billing.sites.quota} />

                  <Text size="xs" c="dimmed">
                    ranges: {ws.billing.allowedRanges.join(", ")}
                  </Text>
                </>
              )}
            </Stack>
          ))}
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
