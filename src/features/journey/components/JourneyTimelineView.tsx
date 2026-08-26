import { Text, Group, Badge, ThemeIcon, Timeline, UnstyledButton } from "@mantine/core";
import { ArrowRight, MousePointerClick } from "lucide-react";
import type { JourneyEvent } from "@/shared/types";
import { dateTime } from "@/shared/lib";

/**
 * The journey as an ordered list — every step, oldest first, with the action
 * that caused it and where it went.
 *
 * The plainest of the readings, and the one that stays legible when a journey
 * runs to hundreds of steps and the diagrams start to crowd.
 */
export function JourneyTimelineView({
  events,
  selectedIndex,
  onSelect,
}: {
  events: JourneyEvent[];
  selectedIndex: number | null;
  onSelect: (i: number) => void;
}) {
  return (
    <Timeline active={events.length} bulletSize={26} lineWidth={2}>
      {events.map((e, i) => (
        <Timeline.Item
          key={i}
          bullet={
            <ThemeIcon
              size={22}
              radius="xl"
              variant={selectedIndex === i ? "filled" : "light"}
              color="emerald"
            >
              <MousePointerClick size={12} />
            </ThemeIcon>
          }
          title={
            <UnstyledButton onClick={() => onSelect(i)}>
              <Text fw={600} size="sm">{e.action}</Text>
            </UnstyledButton>
          }
        >
          <Group gap={6} mt={2} wrap="wrap">
            {e.src && <Badge variant="light" color="gray" radius="sm">{e.src}</Badge>}
            {e.src && e.dest && <ArrowRight size={12} />}
            {e.dest && <Badge variant="light" color="emerald" radius="sm">{e.dest}</Badge>}
          </Group>
          <Text size="xs" c="dimmed" mt={4}>{dateTime(e.ts)}</Text>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
