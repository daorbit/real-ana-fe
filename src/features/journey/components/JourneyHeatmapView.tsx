import { useMemo, useState } from "react";
import { Box, Group, Stack, Text, Center } from "@mantine/core";
import type { JourneyStep } from "@/features/journey/lib/deriveJourney";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CELL = 22;
const GAP = 3;
const LABEL_W = 34;

/**
 * When this user is active: hour of day down, day of week across, each cell
 * shaded by how many steps landed in it.
 *
 * The one reading that ignores order entirely and asks about rhythm instead —
 * whether someone is a weekday-morning user or a Sunday-night one, which no
 * amount of path analysis will tell you and which decides when it is safe to
 * deploy or send them a message.
 */
export function JourneyHeatmapView({ steps }: { steps: JourneyStep[] }) {
  const [hovered, setHovered] = useState<{ day: number; hour: number; count: number } | null>(null);

  const { grid, max, hours } = useMemo(() => {
    const g = new Map<string, number>();
    let peak = 0;

    for (const s of steps) {
      const at = new Date(s.ts);
      const key = `${at.getDay()}-${at.getHours()}`;
      const next = (g.get(key) ?? 0) + s.repeats;
      g.set(key, next);
      if (next > peak) peak = next;
    }

    // Only the hours with something in them, so an app used at 9am and 6pm
    // isn't drawn as twenty-two empty rows framing two full ones.
    const active = [...new Set(steps.map((s) => new Date(s.ts).getHours()))].sort((a, b) => a - b);

    return { grid: g, max: peak, hours: active };
  }, [steps]);

  if (!hours.length) {
    return (
      <Center mih={240}>
        <Text size="sm" c="dimmed">No activity to chart yet.</Text>
      </Center>
    );
  }

  const shade = (count: number) => {
    if (!count) return "var(--surface-2)";
    // Four steps rather than a continuous ramp: a legend of four blocks is
    // readable, a gradient of forty is not.
    const t = count / max;
    const pct = t > 0.75 ? 82 : t > 0.5 ? 58 : t > 0.25 ? 36 : 18;
    return `color-mix(in srgb, var(--accent-2) ${pct}%, transparent)`;
  };

  return (
    <Stack gap="md">
      <Box style={{ overflowX: "auto" }}>
        <svg
          width={LABEL_W + DAYS.length * (CELL + GAP)}
          height={20 + hours.length * (CELL + GAP)}
          onMouseLeave={() => setHovered(null)}
        >
          {DAYS.map((d, i) => (
            <text
              key={d}
              x={LABEL_W + i * (CELL + GAP) + CELL / 2}
              y={12}
              textAnchor="middle"
              fill="var(--text-2)"
              fontSize={10}
              fontWeight={600}
            >
              {d}
            </text>
          ))}

          {hours.map((hour, row) => (
            <g key={hour}>
              <text
                x={LABEL_W - 8}
                y={20 + row * (CELL + GAP) + CELL / 2 + 4}
                textAnchor="end"
                fill="var(--text-2)"
                fontSize={10}
              >
                {String(hour).padStart(2, "0")}
              </text>

              {DAYS.map((_, day) => {
                const count = grid.get(`${day}-${hour}`) ?? 0;
                const active = hovered?.day === day && hovered?.hour === hour;
                return (
                  <rect
                    key={day}
                    x={LABEL_W + day * (CELL + GAP)}
                    y={20 + row * (CELL + GAP)}
                    width={CELL}
                    height={CELL}
                    rx={4}
                    fill={shade(count)}
                    stroke={active ? "var(--accent-2)" : "var(--border)"}
                    strokeWidth={active ? 1.5 : 1}
                    style={{ cursor: count ? "pointer" : "default" }}
                    onMouseEnter={() => setHovered({ day, hour, count })}
                  />
                );
              })}
            </g>
          ))}
        </svg>
      </Box>

      <Group justify="space-between" wrap="wrap" gap="md">
        <Text size="xs" c="dimmed">
          {hovered && hovered.count > 0
            ? `${DAYS[hovered.day]} ${String(hovered.hour).padStart(2, "0")}:00 — ${hovered.count} ${hovered.count === 1 ? "step" : "steps"}`
            : "Each cell is one hour of one weekday, shaded by how much happened in it."}
        </Text>

        <Group gap={6} wrap="nowrap">
          <Text size="xs" c="dimmed">Less</Text>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <Box
              key={t}
              w={14}
              h={14}
              style={{
                borderRadius: 3,
                background: shade(t * max),
                border: "1px solid var(--border)",
              }}
            />
          ))}
          <Text size="xs" c="dimmed">More</Text>
        </Group>
      </Group>
    </Stack>
  );
}
