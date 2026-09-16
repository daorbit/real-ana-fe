import { Card, Divider, Group, Stack, Text } from "@mantine/core";
import { num } from "@/shared/lib";
import type { CloudinaryUsage } from "@/shared/types";
import { bytes } from "./utils";
import { Meter } from "./shared";

export function CloudinaryCard({ usage: u }: { usage: CloudinaryUsage }) {
  const credPct = u.creditsLimit ? (u.creditsUsed ?? 0) / u.creditsLimit * 100 : null;
  const storePct = u.storageLimit ? u.storageUsed / u.storageLimit * 100 : null;
  const bwPct = u.bandwidthLimit ? u.bandwidthUsed / u.bandwidthLimit * 100 : null;
  const metered = credPct != null;

  return (
    <Card withBorder radius="lg" padding="xl">
      <Group justify="space-between" align="baseline" mb="lg">
        <Text fw={700} size="sm">Cloudinary media storage</Text>
        <Text size="xs" c="dimmed" tt="capitalize">{u.plan} plan · {num(u.resources)} assets</Text>
      </Group>

      {metered && (
        <>
          <Meter
            label="Monthly credits"
            used={`${(u.creditsUsed ?? 0).toFixed(2)} credits`}
            limit={`${u.creditsLimit}`}
            pct={credPct}
          />
          <Text size="xs" c="dimmed" mt="xs">
            One credit covers 1&nbsp;GB stored, 1&nbsp;GB delivered, or 1,000
            transformations — there is no separate 25&nbsp;GB storage allowance,
            just this shared pool. Resets monthly.
          </Text>
          <Divider my="lg" />
        </>
      )}

      <Stack gap="xl">
        <Meter
          label={metered ? "Stored now (draws on credits)" : "Storage"}
          used={bytes(u.storageUsed)}
          limit={u.storageLimit ? bytes(u.storageLimit) : undefined}
          pct={storePct}
        />
        <Meter
          label={metered ? "Delivered this cycle (draws on credits)" : "Bandwidth this cycle"}
          used={bytes(u.bandwidthUsed)}
          limit={u.bandwidthLimit ? bytes(u.bandwidthLimit) : undefined}
          pct={bwPct}
        />
      </Stack>
    </Card>
  );
}
