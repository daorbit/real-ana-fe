import { Group, Text, Badge, Tooltip, Box, Popover, Loader, ActionIcon, CloseButton } from "@mantine/core";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useCountUp } from "@/shared/hooks/useCountUp";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";


const ACCENT: Record<string, string> = {
  emerald: "var(--accent)",
  violet: "var(--accent)",
  green: "#34d399",
  cyan: "#22d3ee",
  amber: "#f59e0b",
  pink: "#f472b6",
};


function StatValue({ value }: { value: number | string }) {
  const numeric = typeof value === "number";
  const counted = useCountUp(numeric ? value : 0);
  if (!numeric) return <>{value}</>;
  return <>{Math.round(counted).toLocaleString()}</>;
}

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
  onExplain,
  explaining,
  explanation,
  explainError,
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
  /** "Why did this change?" — rendered only when passed, so cards that don't
   * support it (multi-site view, etc) simply omit the prop. */
  onExplain?: () => void;
  explaining?: boolean;
  explanation?: string | null;
  explainError?: string | null;
}) {
  const accent = ACCENT[color] ?? ACCENT.emerald;
  const sparkId = `spark-${String(label).replace(/\W/g, "")}`;
  const [explainOpen, setExplainOpen] = useState(false);

  return (
    <Box className="stat-card">
      <Box className="stat-card-body" p="lg" pb={spark && spark.length > 1 ? 0 : "lg"}>
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
          <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
            {live ? (
              <span className="live-badge">
                <span className="live-badge__dot" aria-hidden />
                live
              </span>
            ) : delta !== undefined ? (
              <DeltaBadge delta={delta} inverse={inverseDelta} />
            ) : null}
            {onExplain && (
              <Popover
                width={280}
                position="bottom-end"
                withArrow
                shadow="md"
                opened={explainOpen}
                onClose={() => setExplainOpen(false)}
              >
                <Popover.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={() => {
                      const opening = !explainOpen;
                      setExplainOpen(opening);
                      if (opening) onExplain();
                    }}
                    aria-label="Why did this change? — ask Orbit"
                  >
                    {explaining ? <Loader size={10} /> : <OrbitMark size={14} />}
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                  <Group justify="space-between" wrap="nowrap" mb={6} gap={8}>
                    <Text size="xs" fw={600} c="dimmed">Orbit</Text>
                    <CloseButton size="xs" onClick={() => setExplainOpen(false)} />
                  </Group>
                  <Text size="xs" c={explainError ? "red" : undefined}>
                    {explaining ? "Thinking…" : explainError ?? explanation ?? ""}
                  </Text>
                </Popover.Dropdown>
              </Popover>
            )}
          </Group>
        </Group>

        <Text
          className="stat-card-value"
          fw={700}
          lh={1.05}
          style={{
            letterSpacing: "-0.025em",
            color: live ? accent : "var(--text)",
          }}
        >
          <StatValue value={value} />
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
