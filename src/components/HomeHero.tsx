import { Box, Group, Text, Badge } from "@mantine/core";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { num } from "../utils";
import type { Point } from "../types";

/**
 * The band at the top of Home.
 *
 * A dashboard should open with a number, not a greeting. This carries the one
 * hero figure for the view — visitors online right now — with the day's totals
 * as supporting context and the traffic shape behind it.
 *
 * Per the stat-tile spec there is exactly one hero figure per view, which is
 * why the cards below this band top out at 30px.
 */
export function HomeHero({
  workspaceName,
  live,
  visitors,
  pageviews,
  series,
}: {
  workspaceName: string;
  live: number;
  visitors: number;
  pageviews: number;
  series: Point[];
}) {
  const hasShape = series.length > 1;

  return (
    <Box className="hero-band" mb="xl">
      {/* The trend sits behind the numbers as texture rather than as a chart —
          it is context for the hero figure, and the real chart is below. */}
      {hasShape && (
        <div className="hero-spark" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="views"
                stroke="#10b981"
                strokeWidth={2}
                strokeOpacity={0.5}
                fill="url(#heroSpark)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <Box className="hero-content" p="xl">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="xl">
          <div style={{ minWidth: 0 }}>
            <Group gap={8} mb={10} wrap="nowrap">
              <span className="status-dot live" style={{ background: "#34d399" }} />
              <Text size="xs" c="dimmed" fw={600} style={{ letterSpacing: "0.06em" }}>
                ONLINE NOW
              </Text>
            </Group>

            <Group align="baseline" gap="sm" wrap="nowrap">
              {/* Hero figure: ≥48px, same sans as everything else. */}
              <Text
                fw={700}
                fz={56}
                lh={1}
                style={{ letterSpacing: "-0.04em", color: "var(--text)" }}
              >
                {num(live)}
              </Text>
              <Text size="sm" c="dimmed" pb={8}>
                {live === 1 ? "visitor" : "visitors"} on {workspaceName}
              </Text>
            </Group>
          </div>

          {/* Supporting totals — deliberately small, so they read as context
              for the hero rather than competing with it. */}
          <Group gap="xl" wrap="wrap">
            <div>
              <Text size="xs" c="dimmed" fw={500} mb={4}>
                Visitors today
              </Text>
              <Text fw={650} fz={22} lh={1.1} style={{ letterSpacing: "-0.02em" }}>
                {num(visitors)}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" fw={500} mb={4}>
                Pageviews today
              </Text>
              <Text fw={650} fz={22} lh={1.1} style={{ letterSpacing: "-0.02em" }}>
                {num(pageviews)}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" fw={500} mb={4}>
                Period
              </Text>
              <Badge variant="light" color="gray" size="lg" radius="sm">
                Last 24 hours
              </Badge>
            </div>
          </Group>
        </Group>
      </Box>
    </Box>
  );
}
