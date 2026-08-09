import { useMemo } from "react";
import { Box, Card, Group, Stack, Text, useMantineColorScheme } from "@mantine/core";
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { SeoCompetitorComparison, SeoCompetitorHistoryPoint } from "@/shared/types";

/**
 * Competitor scores over time.
 *
 * The side-by-side answers "where do we stand"; this answers "which way is it
 * going", which is the question a single snapshot cannot. A competitor eight
 * points ahead and falling is a different problem from one eight points ahead
 * and climbing.
 *
 * Colour identifies a competitor and nothing else — it never encodes rank, so
 * a competitor keeps its colour when others are added or removed.
 */

/**
 * Categorical slots, in fixed order, stepped per mode.
 *
 * Validated for both surfaces (adjacent pairlist, which is what a line chart
 * uses): worst CVD ΔE 9.1 light / 8.4 dark, worst normal-vision ΔE 19.6 light /
 * 19.3 dark. Assigned in order and never cycled — past six the remaining
 * competitors are dropped from the plot rather than reusing a hue, because two
 * lines the same colour is a chart that lies.
 */
const SERIES_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"];
const SERIES_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300"];

/** Slots available. A seventh competitor is listed below the chart, not plotted. */
const MAX_SERIES = 6;

type Row = { date: string; [competitorId: string]: string | number | null };

/**
 * Where everyone stands right now, as a ranked bar.
 *
 * Shown until there are two days of history to draw a line from. The bar is
 * not a lesser version of the trend — on the day someone adds a competitor it
 * is the more useful of the two, because the question then is "who is ahead",
 * not "which way is this going".
 *
 * Your own score is the reference line rather than a bar: it is the constant
 * every competitor is measured against, and drawing it as one more bar buries
 * that.
 */
function TodayStanding({
  competitors,
  omitted,
  palette,
  dark,
  myScore,
}: {
  competitors: SeoCompetitorComparison[];
  omitted: SeoCompetitorComparison[];
  palette: string[];
  dark: boolean;
  myScore: number;
}) {
  const ranked = [...competitors].sort((a, b) => b.snapshot.score - a.snapshot.score);
  const axis = dark ? "#8b929e" : "#5f6673";

  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={650} size="sm" mb={4}>
        Where everyone stands today
      </Text>
      <Text size="xs" c="dimmed" mb="lg">
        On-page score out of 100. Once competitors have been checked on two
        different days, this becomes a trend line.
      </Text>

      <Stack gap="md">
        {ranked.map((c) => {
          const colour = palette[competitors.indexOf(c) % palette.length];
          const ahead = c.snapshot.score > myScore;
          return (
            <Box key={c.competitorId}>
              <Group justify="space-between" wrap="nowrap" mb={4}>
                <Text size="xs" truncate maw={220}>
                  {c.label}
                </Text>
                <Text size="xs" fw={700} style={{ fontVariantNumeric: "tabular-nums" }}>
                  {c.snapshot.score}
                </Text>
              </Group>
              <Box
                style={{
                  height: 8,
                  borderRadius: 4,
                  background: dark ? "#22252c" : "#f1f3f5",
                  overflow: "hidden",
                }}
              >
                <Box
                  style={{
                    width: `${c.snapshot.score}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: colour,
                  }}
                />
              </Box>
              <Text size="xs" c={ahead ? "red" : "teal"} mt={3}>
                {ahead
                  ? `${c.snapshot.score - myScore} ahead of you`
                  : c.snapshot.score === myScore
                  ? "Level with you"
                  : `${myScore - c.snapshot.score} behind you`}
              </Text>
            </Box>
          );
        })}
      </Stack>

      {/* Your own score, stated once as the thing every bar is measured
          against rather than drawn as another bar competing with them. */}
      <Group justify="space-between" mt="lg" pt="md" style={{ borderTop: `1px solid ${dark ? "#2b2f38" : "#e9ecef"}` }}>
        <Text size="xs" c="dimmed">
          Your page
        </Text>
        <Text size="xs" fw={700} c="emerald" style={{ fontVariantNumeric: "tabular-nums" }}>
          {myScore}
        </Text>
      </Group>

      {omitted.length > 0 && (
        <Text size="xs" c={axis} mt="sm">
          Not shown: {omitted.map((c) => c.label).join(", ")}.
        </Text>
      )}
    </Card>
  );
}

export function ScoreTrendChart({
  history,
  competitors,
  myScore,
}: {
  history: SeoCompetitorHistoryPoint[];
  competitors: SeoCompetitorComparison[];
  /** Your own on-page score, the constant every competitor is measured against. */
  myScore: number;
}) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const palette = dark ? SERIES_DARK : SERIES_LIGHT;

  const plotted = competitors.slice(0, MAX_SERIES);
  const omitted = competitors.slice(MAX_SERIES);

  const rows = useMemo<Row[]>(() => {
    // Bucketed by day: several refreshes on one day are the same point on a
    // trend line, and plotting each would draw a vertical scribble.
    const byDate = new Map<string, Row>();

    for (const point of history) {
      // A failed fetch records a row so the failure is visible in the list, but
      // its score is not a real measurement and must not dent the line.
      if (point.statusCode >= 400) continue;

      const date = point.takenAt.slice(0, 10);
      const row = byDate.get(date) ?? { date };
      row[point.competitorId] = point.score;
      byDate.set(date, row);
    }

    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [history]);

  // One point per series draws no line anyone can follow. Rather than showing
  // an empty card until tomorrow, the same scores are drawn as a ranked bar —
  // "where everyone stands today" is a real answer, and it is the only one
  // available on the day competitors are added.
  if (rows.length < 2) {
    return (
      <TodayStanding
        competitors={plotted}
        omitted={omitted}
        palette={palette}
        dark={dark}
        myScore={myScore}
      />
    );
  }

  const axis = dark ? "#8b929e" : "#5f6673";
  const grid = dark ? "#2b2f38" : "#e9ecef";

  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={650} size="sm" mb={4}>
        Score over time
      </Text>
      <Text size="xs" c="dimmed" mb="md">
        On-page score at each recorded check. Failed fetches are left out.
      </Text>

      <Box h={260}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: axis, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: grid }}
              minTickGap={24}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              contentStyle={{
                background: dark ? "#1a1c22" : "#ffffff",
                border: `1px solid ${grid}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: axis, marginBottom: 4 }}
              formatter={(value, name) => {
                const match = plotted.find((c) => c.competitorId === name);
                return [value, match?.label ?? String(name)];
              }}
            />
            {plotted.map((c, i) => (
              <Line
                key={c.competitorId}
                type="monotone"
                dataKey={c.competitorId}
                name={c.competitorId}
                stroke={palette[i]}
                strokeWidth={2}
                // Markers make each recorded check visible as a point rather
                // than an interpolation, and give the hover a real target.
                dot={{ r: 3, strokeWidth: 0, fill: palette[i] }}
                activeDot={{ r: 5 }}
                // A gap in one competitor's history must not break the line
                // for the others.
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Always present, never colour alone: the swatch carries identity and the
          label names it, which is also the relief the light-mode contrast
          warning requires. */}
      <Group gap="md" mt="md" wrap="wrap">
        {plotted.map((c, i) => (
          <Group key={c.competitorId} gap={6} wrap="nowrap">
            <Box
              w={10}
              h={10}
              style={{ borderRadius: 2, background: palette[i], flexShrink: 0 }}
            />
            <Text size="xs" c="dimmed" truncate maw={160}>
              {c.label}
            </Text>
          </Group>
        ))}
      </Group>

      {omitted.length > 0 && (
        <Text size="xs" c="dimmed" mt="sm">
          Not plotted: {omitted.map((c) => c.label).join(", ")}. The chart shows the
          first {MAX_SERIES} competitors so no two lines share a colour.
        </Text>
      )}
    </Card>
  );
}
