import {
  Card, Group, Text, Stack, Center, ThemeIcon, Progress, Badge, Code,
} from "@mantine/core";
import { Zap, Inbox } from "lucide-react";
import { num, share } from "../utils";
import type { EventBucket } from "../types";

/**
 * Custom events fired from the tracked site via `rta.track(name, props)`.
 * Each row is one event name with its total fires, distinct visitors, and the
 * share of visitors who did it at least once (its conversion rate).
 */
export function CustomEventsPanel({ items }: { items: EventBucket[] }) {
  const total = items.reduce((sum, i) => sum + i.count, 0);
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <Card withBorder radius="lg" padding="lg">
      <Group gap={8} mb="md">
        <Zap size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">Custom events</Text>
      </Group>

      {items.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="xs" maw={420}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md">
              <Inbox size={16} />
            </ThemeIcon>
            <Text c="dimmed" size="xs" ta="center">
              No custom events yet. Fire one from your site to track signups,
              purchases, or any action that matters:
            </Text>
            <Code block style={{ fontSize: 12 }}>
              {`rta.track("signup", { plan: "pro" });`}
            </Code>
          </Stack>
        </Center>
      ) : (
        <Stack gap="md">
          {items.map((i) => (
            <div key={i.key}>
              <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
                <Text size="sm" fw={500} truncate style={{ flex: 1 }}>{i.key}</Text>
                <Group gap={8} wrap="nowrap">
                  <Badge variant="light" color="emerald" size="sm">
                    {i.conversionRate}% conv.
                  </Badge>
                  <Text size="xs" c="dimmed">{share(i.count, total)}</Text>
                  <Text size="sm" fw={700}>{num(i.count)}</Text>
                </Group>
              </Group>
              <Progress value={(i.count / max) * 100} size="sm" radius="xl" color="grape" />
              <Text size="xs" c="dimmed" mt={3}>
                {num(i.visitors)} visitor{i.visitors === 1 ? "" : "s"}
              </Text>
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}
