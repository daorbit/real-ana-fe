import { Card, Group, Text, Stack, Center, ThemeIcon, Progress } from "@mantine/core";
import { Inbox, Repeat } from "lucide-react";
import { num, share } from "@/shared/lib";
import type { VisitorSplit } from "@/shared/types";

/**
 * First-time vs repeat visitors over the selected window.
 *
 * The visitor hash rotates daily for privacy, so a "returning" visitor is one
 * seen before this window opened rather than a lifetime-loyal one — the note at
 * the foot of the card says so, because the number reads very differently
 * depending on which you assume.
 */
export function VisitorSplitPanel({ split }: { split?: VisitorSplit | null }) {
  const total = (split?.new ?? 0) + (split?.returning ?? 0);

  return (
    <Card withBorder radius="lg" padding="lg">
      <Group gap={8} mb="md">
        <Repeat size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">New vs returning</Text>
      </Group>

      {total === 0 ? (
        <Center py="lg" mih={120}>
          <Stack align="center" gap={4}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md">
              <Inbox size={16} />
            </ThemeIcon>
            <Text c="dimmed" size="xs">No visitors in this range yet</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          <Row label="New" value={split!.new} total={total} color="emerald" />
          <Row label="Returning" value={split!.returning} total={total} color="cyan" />

          <Text c="dimmed" size="xs" mt={4}>
            Unique visitors in this range: <Text span fw={700} c="var(--mantine-color-text)">{num(total)}</Text>.
            A visitor counts as returning when they were also seen before the
            range started.
          </Text>
        </Stack>
      )}
    </Card>
  );
}

/** One labelled bar, sized against the window's visitor total. */
function Row({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  return (
    <div>
      <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
        <Text size="sm" truncate style={{ flex: 1 }}>{label}</Text>
        <Group gap={6} wrap="nowrap">
          <Text size="xs" c="dimmed">{share(value, total)}</Text>
          <Text size="sm" fw={700}>{num(value)}</Text>
        </Group>
      </Group>
      <Progress value={total > 0 ? (value / total) * 100 : 0} size="sm" radius="xl" color={color} />
    </div>
  );
}
