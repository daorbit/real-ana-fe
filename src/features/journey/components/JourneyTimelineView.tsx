import { Text, Group, Badge, ThemeIcon, Stack, UnstyledButton, Box, Divider } from "@mantine/core";
import { ArrowRight, MousePointerClick, Clock, Layers } from "lucide-react";
import { dateTime } from "@/shared/lib";
import { gapLabel, groupSessions, type JourneyStep } from "@/features/journey/lib/deriveJourney";

/**
 * The journey as an ordered list, grouped into the visits it happened across.
 *
 * The plainest of the readings and the one that stays legible when a journey
 * runs to hundreds of steps. Sessions carry the headers because "what did
 * they do in one sitting" is the question a flat list of three hundred rows
 * cannot answer.
 */
export function JourneyTimelineView({
  steps,
  selectedIndex,
  onSelect,
}: {
  steps: JourneyStep[];
  selectedIndex: number | null;
  onSelect: (i: number) => void;
}) {
  const sessions = groupSessions(steps);

  return (
    <Stack gap="xl">
      {sessions.map((session, si) => (
        <Box key={`${session.id}-${si}`}>
          <Group gap="xs" mb="sm" wrap="nowrap">
            <ThemeIcon variant="light" color="gray" size="sm" radius="sm">
              <Layers size={13} />
            </ThemeIcon>
            <Text size="xs" fw={650}>Session {si + 1}</Text>
            <Text size="xs" c="dimmed">{dateTime(session.startedAt)}</Text>
            <Text size="xs" c="dimmed">&bull;</Text>
            <Text size="xs" c="dimmed">
              {session.steps.length} {session.steps.length === 1 ? "step" : "steps"}
            </Text>
            {session.durationMs > 0 && (
              <>
                <Text size="xs" c="dimmed">&bull;</Text>
                <Text size="xs" c="dimmed">{gapLabel(session.durationMs)}</Text>
              </>
            )}
          </Group>

          <Stack gap={0} pl="xs">
            {session.steps.map((step, i) => (
              <Box key={step.index}>
                {/* The gap since the previous step, drawn between the two it
                    separates — the pause is part of the story ("they sat on
                    the pricing page for four minutes"). */}
                {i > 0 && step.sincePrev !== null && (
                  <Group gap={4} pl={30} py={2} wrap="nowrap">
                    <Clock size={10} style={{ color: "var(--text-2)" }} />
                    <Text size="xs" c="dimmed">{gapLabel(step.sincePrev)}</Text>
                  </Group>
                )}

                <UnstyledButton
                  onClick={() => onSelect(step.index)}
                  style={{ display: "block", width: "100%" }}
                >
                  <Group
                    gap="sm"
                    wrap="nowrap"
                    align="flex-start"
                    p="xs"
                    style={{
                      borderRadius: 8,
                      background:
                        selectedIndex === step.index ? "var(--surface-2)" : undefined,
                    }}
                  >
                    <ThemeIcon
                      size={22}
                      radius="xl"
                      variant={selectedIndex === step.index ? "filled" : "light"}
                      color="emerald"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    >
                      <MousePointerClick size={12} />
                    </ThemeIcon>

                    <Box style={{ minWidth: 0, flex: 1 }}>
                      <Group gap={6} wrap="nowrap">
                        <Text fw={600} size="sm">{step.action}</Text>
                        {step.repeats > 1 && (
                          <Badge size="xs" variant="light" color="amber" radius="sm">
                            ×{step.repeats}
                          </Badge>
                        )}
                      </Group>

                      <Group gap={6} mt={2} wrap="wrap">
                        {step.src && (
                          <Badge variant="light" color="gray" radius="sm">{step.src}</Badge>
                        )}
                        {step.src && step.dest && <ArrowRight size={12} />}
                        {step.dest && (
                          <Badge variant="light" color="emerald" radius="sm">{step.dest}</Badge>
                        )}
                      </Group>

                      <Text size="xs" c="dimmed" mt={4}>{dateTime(step.ts)}</Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Box>
            ))}
          </Stack>

          {si < sessions.length - 1 && <Divider mt="lg" variant="dashed" />}
        </Box>
      ))}
    </Stack>
  );
}
