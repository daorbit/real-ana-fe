import { Card, Group, Text, Stack, Center, ThemeIcon, Badge, Progress, Tooltip } from "@mantine/core";
import { ExternalLink, Download, AlertTriangle, Inbox } from "lucide-react";
import { num, timeAgo } from "../utils";
import type { OutboundBucket, ErrorBucket } from "../types";

/** Outbound link clicks and file downloads — where visitors go when they leave. */
export function OutboundPanel({ items }: { items: OutboundBucket[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group gap={8} mb="md">
        <ExternalLink size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">Outbound &amp; downloads</Text>
      </Group>

      {items.length === 0 ? (
        <Empty label="No outbound clicks or downloads yet" />
      ) : (
        <Stack gap="sm">
          {items.map((i) => (
            <div key={i.kind + i.key}>
              <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
                <Group gap={7} wrap="nowrap" style={{ minWidth: 0 }}>
                  {i.kind === "download" ? (
                    <Download size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
                  ) : (
                    <ExternalLink size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
                  )}
                  <Text size="sm" truncate title={i.key}>{i.key || "(unknown)"}</Text>
                </Group>
                <Text size="sm" fw={700}>{num(i.count)}</Text>
              </Group>
              <Progress value={(i.count / max) * 100} size="xs" radius="xl" color="cyan" />
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}

/** Client-side errors the tracker forwarded — broken pages, failed scripts. */
export function ErrorsPanel({ items }: { items: ErrorBucket[] }) {
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group gap={8} mb="md">
        <AlertTriangle size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">JavaScript errors</Text>
      </Group>

      {items.length === 0 ? (
        <Empty label="No errors reported — all clear" />
      ) : (
        <Stack gap="sm">
          {items.map((i, idx) => (
            <Group key={idx} justify="space-between" gap="sm" wrap="nowrap" align="flex-start">
              <div style={{ minWidth: 0 }}>
                <Text size="sm" truncate title={i.key}>{i.key || "(unknown error)"}</Text>
                <Group gap={6} wrap="nowrap">
                  <Text size="xs" c="dimmed" truncate>{i.path}</Text>
                  {i.lastSeen && (
                    <Tooltip label={new Date(i.lastSeen).toLocaleString()} withArrow>
                      <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>· {timeAgo(i.lastSeen)}</Text>
                    </Tooltip>
                  )}
                </Group>
              </div>
              <Badge color="red" variant="light" size="sm" style={{ flexShrink: 0 }}>
                {num(i.count)}
              </Badge>
            </Group>
          ))}
        </Stack>
      )}
    </Card>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <Center py="xl" mih={120}>
      <Stack align="center" gap={4}>
        <ThemeIcon variant="light" color="gray" size="md" radius="md"><Inbox size={16} /></ThemeIcon>
        <Text c="dimmed" size="xs">{label}</Text>
      </Stack>
    </Center>
  );
}
