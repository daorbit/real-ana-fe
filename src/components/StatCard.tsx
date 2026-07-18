import { Group, Text, Badge, Tooltip, Box } from "@mantine/core";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * The accent each metric's trend line is drawn in.
 *
 * Only the sparkline and the icon wear this — the card surface stays neutral.
 * Six tinted cards side by side means nothing is emphasised, and the tints were
 * decoration rather than encoding: they carried no information the label didn't
 * already give.
 */
const ACCENT: Record<string, string> = {
  emerald: "#10b981",
  violet: "#10b981",
  green: "#34d399",
  cyan: "#22d3ee",
  amber: "#f59e0b",
  pink: "#f472b6",
};

/** A rising bounce rate is bad, so some metrics invert the good/bad colouring. */
function DeltaBadge({ delta, inverse }: { delta: number | null; inverse?: boolean }) {
  if (delta === null) {
    return (
      <Text size="xs" c="dimmed" fw={500}>
        —
      </Text>
    );
  }
  const up = delta > 0;
  const flat = delta === 0;
  const good = inverse ? !up : up;
  const color = flat ? "gray" : good ? "teal" : "red";
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;

  return (
    <Badge size="sm" variant="light" color={color} leftSection={<Icon size={10} />}>
      {up ? "+" : ""}
      {delta}%
    </Badge>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color = "emerald",
  live,
  delta,
  inverseDelta,
  spark,
  sparkKey = "views",
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: keyof typeof ACCENT | string;
  live?: boolean;
  /** % change vs. the previous equal-length period */
  delta?: number | null;
  /** true when a rising value is bad (e.g. bounce rate) */
  inverseDelta?: boolean;
  /** tiny trend line rendered at the bottom of the card */
  spark?: Record<string, number | string>[];
  sparkKey?: string;
  /** Plain-language explanation of what this metric means, shown on an info icon. */
  hint?: string;
}) {
  const accent = ACCENT[color] ?? ACCENT.emerald;
  const sparkId = `spark-${String(label).replace(/\W/g, "")}`;

  return (
    <Box className="stat-card">
      <Box p="lg" pb={spark && spark.length > 1 ? 0 : "lg"}>
        {/* Label first: you read what it is, then the number. Leading with a
            40px icon block made every card look identical at a glance. */}
        <Group justify="space-between" align="center" wrap="nowrap" mb="sm">
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
            <Icon size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <Text size="xs" c="dimmed" fw={500} truncate style={{ letterSpacing: "0.01em" }}>
              {label}
            </Text>
            {hint && (
              <Tooltip
                label={hint}
                multiline
                w={240}
                withArrow
                events={{ hover: true, focus: true, touch: true }}
              >
                <Info
                  size={12}
                  className="stat-hint"
                  style={{ color: "var(--muted)", cursor: "help", flexShrink: 0 }}
                />
              </Tooltip>
            )}
          </Group>
          {live ? (
            <Badge color="green" variant="dot" size="sm">
              live
            </Badge>
          ) : delta !== undefined ? (
            <DeltaBadge delta={delta} inverse={inverseDelta} />
          ) : null}
        </Group>

        {/* Proportional figures, not tabular: at 30px, tabular spacing makes a
            number like 121 look gappy. Columns of numbers still use tabular. */}
        <Text
          fw={700}
          fz={30}
          lh={1.05}
          style={{
            letterSpacing: "-0.025em",
            color: live ? accent : "var(--text)",
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </Text>
      </Box>

      {spark && spark.length > 1 && (
        <div style={{ height: 46, marginTop: 10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={sparkId} x1="0" y1="0" x2="0" y2="1">
                  {/* ~10% wash, per the area-fill spec — a saturated block
                      competes with the value above it. */}
                  <stop offset="0%" stopColor={accent} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={sparkKey}
                stroke={accent}
                strokeWidth={2}
                fill={`url(#${sparkId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Box>
  );
}
