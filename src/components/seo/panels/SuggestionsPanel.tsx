import {
  Accordion, Alert, Badge, Box, Card, Center, Group, RingProgress, Stack, Text, ThemeIcon,
} from "@mantine/core";
import { Info, Gauge, ShieldCheck } from "lucide-react";
import type { SeoPerformance } from "../../../types";
import { scoreColor } from "../ScoreRing";

export function SuggestionsPanel({ performance }: { performance: SeoPerformance }) {
  // No Lighthouse data at all — an older report, or a run Google could not
  // complete. Either way the fix is the same: run it again.
  if (!performance.available) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Stack align="center" gap="xs" maw={400}>
            <ThemeIcon size={48} radius="xl" variant="light" color="gray">
              <Gauge size={24} />
            </ThemeIcon>
            <Text fw={650}>No Lighthouse data</Text>
            <Text size="sm" c="dimmed" ta="center">
              This report has no Lighthouse audit attached. Re-run it to pull fresh
              performance, accessibility and SEO scores.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  if (!performance.suggestions.length) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Stack align="center" gap="xs" maw={380}>
            <ThemeIcon size={48} radius="xl" variant="light" color="teal">
              <ShieldCheck size={24} />
            </ThemeIcon>
            <Text fw={650}>Clean sweep</Text>
            <Text size="sm" c="dimmed" ta="center">
              Lighthouse found nothing to fix on this page.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      <Alert color="blue" variant="light" icon={<Info size={16} />} radius="md">
        Sorted worst first. Each entry is a Lighthouse audit this page failed, with what to
        change and roughly what it saves.
      </Alert>
      <Accordion variant="separated" radius="md">
        {performance.suggestions.map((s) => (
          <Accordion.Item key={s.id} value={s.id}>
            <Accordion.Control>
              <Group gap="sm" wrap="nowrap">
                <RingProgress
                  size={38}
                  thickness={4}
                  roundCaps
                  sections={[{ value: s.score, color: scoreColor(s.score) }]}
                  label={
                    <Text ta="center" size="xs" fw={700}>
                      {s.score}
                    </Text>
                  }
                />
                <div style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} truncate>
                    {s.title}
                  </Text>
                  <Group gap={6}>
                    <Badge size="xs" variant="default" tt="capitalize">
                      {s.category.replace("-", " ")}
                    </Badge>
                    {s.displayValue && (
                      <Text size="xs" c="dimmed">
                        {s.displayValue}
                      </Text>
                    )}
                  </Group>
                </div>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm" pl={4}>
                <Text size="sm" lh={1.6}>
                  {s.advice}
                </Text>
                {s.description && s.description !== s.advice && (
                  <Text size="xs" c="dimmed" lh={1.55}>
                    {s.description}
                  </Text>
                )}
                {s.resources.length > 0 && (
                  <Box>
                    <Text size="xs" fw={650} c="dimmed" mb={5} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                      Affected resources
                    </Text>
                    <Stack gap={3}>
                      {s.resources.map((r) => (
                        <Text key={r} size="xs" c="dimmed" truncate>
                          {r}
                        </Text>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
}
