import { Box, Group, Text, Tooltip as MantineTooltip } from "@mantine/core";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import type { SeoReportSummary } from "../../types";
import { shortDate } from "../../utils";

type TrendPoint = { id: string; score: number; date: string };

type TrendTipProps = {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
};

/**
 * Overall score across recent audits of the same URL.
 *
 * History is stored newest-first for the table; a chart has to read
 * oldest-to-newest or the trend runs backwards.
 */
export function ScoreTrend({
  history,
  url,
  onSelect,
}: {
  history: SeoReportSummary[];
  /** Only runs against this URL are comparable, so the series is filtered to it. */
  url: string;
  onSelect?: (reportId: string) => void;
}) {
  const runs = history
    .filter((h) => h.url === url)
    .slice()
    .reverse();

  // One point is not a trend, and a lone dot reads as a broken chart.
  if (runs.length < 2) return null;

  const points = runs.map((r) => ({
    id: r._id,
    score: r.score,
    date: r.createdAt,
  }));

  const first = points[0].score;
  const last = points[points.length - 1].score;
  const delta = last - first;

  const color = delta > 0 ? "#10b981" : delta < 0 ? "#ef4444" : "#6b7280";
  const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <Box>
      <Group justify="space-between" mb={6} wrap="nowrap">
        <Text size="xs" fw={650} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }}>
          Score trend
        </Text>
        <MantineTooltip
          label={`${first} on the first of these ${points.length} runs, ${last} now`}
          withArrow
        >
          <Group gap={4} wrap="nowrap" style={{ cursor: "help" }}>
            <Icon size={13} color={color} />
            <Text size="xs" fw={600} style={{ color }}>
              {delta > 0 ? "+" : ""}
              {delta}
            </Text>
            <Text size="xs" c="dimmed">
              over {points.length} runs
            </Text>
          </Group>
        </MantineTooltip>
      </Group>

      <Box h={64}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={points}
            margin={{ top: 4, right: 2, bottom: 0, left: 2 }}
            // Recharts v3 reports the active index rather than the datum, so
            // the point is looked up in our own array.
            onClick={(state) => {
              const i = state?.activeIndex;
              if (!onSelect || typeof i !== "number") return;
              const point = points[i];
              if (point) onSelect(point.id);
            }}
          >
            <defs>
              <linearGradient id="seo-trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Fixed 0-100 domain: an auto domain would rescale every render and
                make a two-point wobble look like a collapse. */}
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={color}
              strokeWidth={2}
              fill="url(#seo-trend-fill)"
              dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

/**
 * Recharts' tooltip content props are awkward to type across versions, so this
 * follows the same locally-typed shape the dashboard's other charts use.
 */
function TrendTooltip({ active, payload }: TrendTipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <Box
      px="sm"
      py={6}
      style={{
        background: "var(--mantine-color-body)",
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: 8,
      }}
    >
      <Text size="xs" fw={700}>
        Score {point.score}
      </Text>
      <Text size="xs" c="dimmed">
        {shortDate(point.date)}
      </Text>
    </Box>
  );
}
