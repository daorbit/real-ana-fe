import { Card, Group, Text, Stack, Center, ThemeIcon, Tooltip } from "@mantine/core";
import { CalendarClock, Inbox } from "lucide-react";
import type { HeatCell } from "../types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * When traffic actually happens, by weekday and hour.
 *
 * Colour is scaled against the busiest cell rather than an absolute number —
 * a site with 50 views a week and one with 50,000 should both show a readable
 * pattern, not a uniform block.
 */
export function Heatmap({ cells }: { cells: HeatCell[] }) {
  const max = Math.max(1, ...cells.map((c) => c.count));

  // Sparse input: most day/hour pairs have no traffic at all.
  const byCell = new Map(cells.map((c) => [`${c.day}-${c.hour}`, c.count]));
  const empty = cells.length === 0;

  return (
    <Card withBorder radius="lg" padding="lg">
      <Group gap={8} mb="md">
        <CalendarClock size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">When your visitors show up</Text>
      </Group>

      {empty ? (
        <Center py="lg">
          <Stack align="center" gap={4}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md">
              <Inbox size={16} />
            </ThemeIcon>
            <Text c="dimmed" size="xs">Waiting for data…</Text>
          </Stack>
        </Center>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 560 }}>
            {DAYS.map((day, d) => (
              <Group key={day} gap={3} wrap="nowrap" mb={3} align="center">
                <Text size="xs" c="dimmed" w={32} style={{ flexShrink: 0 }}>
                  {day}
                </Text>
                {Array.from({ length: 24 }, (_, h) => {
                  const count = byCell.get(`${d}-${h}`) ?? 0;
                  return (
                    <Tooltip
                      key={h}
                      label={`${day} ${String(h).padStart(2, "0")}:00 — ${count} view${count === 1 ? "" : "s"}`}
                      withArrow
                      openDelay={80}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 18,
                          minWidth: 14,
                          borderRadius: 3,
                          background: count
                            ? `color-mix(in srgb, var(--mantine-color-emerald-6) ${Math.round(
                                (count / max) * 100
                              )}%, transparent)`
                            : "var(--surface)",
                          border: "1px solid var(--border)",
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Group>
            ))}

            <Group gap={3} wrap="nowrap" mt={6} align="center">
              <div style={{ width: 32, flexShrink: 0 }} />
              {Array.from({ length: 24 }, (_, h) => (
                <Text
                  key={h}
                  size="9px"
                  c="dimmed"
                  ta="center"
                  style={{ flex: 1, minWidth: 14 }}
                >
                  {/* Every hour label would be unreadable at this width. */}
                  {h % 3 === 0 ? h : ""}
                </Text>
              ))}
            </Group>
          </div>
        </div>
      )}
    </Card>
  );
}
