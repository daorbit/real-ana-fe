import { Card, Group, Text, ThemeIcon, Badge, Tooltip } from "@mantine/core";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TINT: Record<string, { from: string; to: string; icon: string; ring: string }> = {
  emerald: { from: "rgba(16,185,129,0.16)",  to: "rgba(16,185,129,0.02)",  icon: "#34d399", ring: "rgba(16,185,129,0.32)" },
  violet:  { from: "rgba(16,185,129,0.16)",  to: "rgba(16,185,129,0.02)",  icon: "#34d399", ring: "rgba(16,185,129,0.32)" },
  green:   { from: "rgba(52,211,153,0.16)",  to: "rgba(52,211,153,0.02)",  icon: "#34d399", ring: "rgba(52,211,153,0.32)" },
  cyan:    { from: "rgba(34,211,238,0.16)",  to: "rgba(34,211,238,0.02)",  icon: "#22d3ee", ring: "rgba(34,211,238,0.32)" },
  amber:   { from: "rgba(245,158,11,0.16)",  to: "rgba(245,158,11,0.02)",  icon: "#f59e0b", ring: "rgba(245,158,11,0.32)" },
  pink:    { from: "rgba(244,114,182,0.16)", to: "rgba(244,114,182,0.02)", icon: "#f472b6", ring: "rgba(244,114,182,0.32)" },
};

/** A rising bounce rate is bad, so some metrics invert the good/bad colouring. */
function DeltaBadge({ delta, inverse }: { delta: number | null; inverse?: boolean }) {
  if (delta === null) {
    return (
      <Badge size="sm" variant="light" color="gray" leftSection={<Minus size={10} />}>
        —
      </Badge>
    );
  }
  const up = delta > 0;
  const flat = delta === 0;
  const good = inverse ? !up : up;
  const color = flat ? "gray" : good ? "teal" : "red";
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;

  return (
    <Badge size="sm" variant="light" color={color} leftSection={<Icon size={10} />}>
      {up ? "+" : ""}{delta}%
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
  color?: keyof typeof TINT | string;
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
  const t = TINT[color] ?? TINT.emerald;
  const sparkId = `spark-${String(label).replace(/\W/g, "")}`;

  return (
    <Card
      radius="lg"
      padding="lg"
      style={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${t.from}, ${t.to}), var(--mantine-color-body)`,
        border: `1px solid ${t.ring}`,
      }}
    >
      <Group justify="space-between" align="flex-start">
        <ThemeIcon
          size={40}
          radius="md"
          variant="filled"
          style={{ background: "rgba(255,255,255,0.06)", color: t.icon, border: `1px solid ${t.ring}` }}
        >
          <Icon size={19} />
        </ThemeIcon>
        {live ? (
          <Badge color="green" variant="dot" size="sm">live</Badge>
        ) : delta !== undefined ? (
          <DeltaBadge delta={delta} inverse={inverseDelta} />
        ) : null}
      </Group>

      <Text
        fw={800}
        fz={32}
        mt="md"
        lh={1}
        style={{ letterSpacing: "-0.03em", color: live ? t.icon : "var(--mantine-color-text)" }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </Text>
      <Group gap={5} mt={6} wrap="nowrap">
        <Text c="dimmed" size="sm">{label}</Text>
        {hint && (
          <Tooltip label={hint} multiline w={240} withArrow events={{ hover: true, focus: true, touch: true }}>
            <Info size={13} className="stat-hint" style={{ color: "var(--mantine-color-dimmed)", cursor: "help", flexShrink: 0 }} />
          </Tooltip>
        )}
      </Group>

      {spark && spark.length > 1 && (
        <div style={{ marginTop: 12, marginLeft: -20, marginRight: -20, marginBottom: -20, height: 44 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={sparkId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.icon} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={t.icon} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={sparkKey}
                stroke={t.icon}
                strokeWidth={2}
                fill={`url(#${sparkId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
