import { Card, Group, Text, Stack, Center, ThemeIcon, Progress, Badge, Tooltip } from "@mantine/core";
import { MousePointerClick, Link2 } from "lucide-react";
import { num, share } from "../utils";
import type { ClickBucket } from "../types";

/**
 * Which CTA was clicked, and on which page. The same button on two pages shows
 * as two rows, so you can see where it actually converts.
 */
export function ClicksPanel({
  clicks,
  total,
  limit = 8,
}: {
  clicks: ClickBucket[];
  total: number;
  limit?: number;
}) {
  const rows = clicks.slice(0, limit);
  const max = Math.max(1, ...rows.map((c) => c.count));

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Group gap={8}>
          <MousePointerClick size={15} className="sect-ic" />
          <Text fw={600} c="dimmed" size="sm">CTA clicks</Text>
        </Group>
        {total > 0 && <Badge variant="light" color="gray" size="sm">{num(total)} total</Badge>}
      </Group>

      {rows.length === 0 ? (
        <Center py="lg">
          <Stack align="center" gap={4}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md">
              <MousePointerClick size={16} />
            </ThemeIcon>
            <Text c="dimmed" size="xs" ta="center" maw={240}>
              No clicks recorded yet. Buttons and links are tracked automatically.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {rows.map((c) => (
            <div key={`${c.key}|${c.path}`}>
              <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
                <Group gap={6} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                  <Text size="sm" truncate>{c.key}</Text>
                  <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>on</Text>
                  <Text size="xs" c="dimmed" truncate>{c.path}</Text>
                  {c.href && (
                    <Tooltip label={c.href} withArrow>
                      <Link2 size={12} className="click-href" />
                    </Tooltip>
                  )}
                </Group>
                <Group gap={6} wrap="nowrap">
                  <Text size="xs" c="dimmed">{share(c.count, total)}</Text>
                  <Text size="sm" fw={700}>{num(c.count)}</Text>
                </Group>
              </Group>
              <Progress value={(c.count / max) * 100} size="sm" radius="xl" color="grape" />
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}
