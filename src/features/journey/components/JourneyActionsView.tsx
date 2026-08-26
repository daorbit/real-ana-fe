import { useMemo } from "react";
import { Box, Group, Stack, Text, Center, Progress, Badge } from "@mantine/core";
import type { JourneyStep } from "@/features/journey/lib/deriveJourney";

/**
 * What this user actually does, as a ranked list.
 *
 * The plainest possible reading and often the fastest answer: before asking
 * where someone goes, it is worth knowing that 80% of their steps are one
 * action. Sorted by frequency, with the screens each action fires on, so a
 * generic name like "nav_clicked" still says where it happened.
 */
export function JourneyActionsView({ steps }: { steps: JourneyStep[] }) {
  const rows = useMemo(() => {
    const counts = new Map<string, { count: number; screens: Set<string> }>();

    for (const s of steps) {
      const hit = counts.get(s.action) ?? { count: 0, screens: new Set<string>() };
      hit.count += s.repeats;
      if (s.src) hit.screens.add(s.src);
      counts.set(s.action, hit);
    }

    const total = [...counts.values()].reduce((sum, c) => sum + c.count, 0);

    return [...counts.entries()]
      .map(([action, hit]) => ({
        action,
        count: hit.count,
        screens: [...hit.screens],
        share: total ? Math.round((hit.count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [steps]);

  if (!rows.length) {
    return (
      <Center mih={240}>
        <Text size="sm" c="dimmed">No actions to rank yet.</Text>
      </Center>
    );
  }

  const busiest = rows[0].count;

  return (
    <Stack gap="lg">
      {rows.map((row) => (
        <Box key={row.action}>
          <Group justify="space-between" mb={6} wrap="nowrap" gap="sm">
            <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>{row.action}</Text>
              {row.screens.length > 0 && (
                <Text size="xs" c="dimmed" truncate>
                  on {row.screens.slice(0, 2).join(", ")}
                  {row.screens.length > 2 ? ` +${row.screens.length - 2}` : ""}
                </Text>
              )}
            </Group>

            <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>
              <Text size="sm" fw={650}>{row.count}</Text>
              <Badge variant="light" color="gray" radius="sm">{row.share}%</Badge>
            </Group>
          </Group>

          {/* Scaled against the busiest action rather than the total, so the
              shape of the ranking stays visible when one action dominates. */}
          <Progress
            value={(row.count / busiest) * 100}
            color="emerald"
            size="md"
            radius="sm"
          />
        </Box>
      ))}
    </Stack>
  );
}
