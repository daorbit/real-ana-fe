import { Box, Group, Text, Tooltip } from "@mantine/core";
import { Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCountUp } from "@/shared/hooks/useCountUp";
import { compact, num } from "@/shared/lib";
import { StatDelta } from "@/shared/ui/stat/StatDelta";
import type { StatComparison } from "@/shared/ui/stat/StatDelta";
import { StatSpark } from "@/shared/ui/stat/StatSpark";
import { StatExplain } from "@/shared/ui/stat/StatExplain";
import classes from "@/shared/ui/stat/StatCard.module.css";

export type { StatComparison };

export const ACCENT: Record<string, string> = {
  emerald: "var(--accent)",
  violet: "var(--accent)",
  green: "#34d399",
  cyan: "#22d3ee",
  amber: "#f59e0b",
  pink: "#f472b6",
};

const COMPACT_FROM = 100_000;

function StatValue({ value }: { value: number | string }) {
  const numeric = typeof value === "number";
  const counted = useCountUp(numeric ? value : 0);
  if (!numeric) return <>{value}</>;
  const rounded = Math.round(counted);
  if (value < COMPACT_FROM) return <>{num(rounded)}</>;
  return (
    <Tooltip label={num(value)} withArrow position="top-start">
      <span>{compact(rounded)}</span>
    </Tooltip>
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
  comparison,
  spark,
  sparkKey = "views",
  syncId,
  hint,
  onExplain,
  explaining,
  explanation,
  explainError,
  leading,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: keyof typeof ACCENT | string;
  live?: boolean;
  delta?: number | null;
  inverseDelta?: boolean;
  comparison?: StatComparison;
  spark?: Record<string, number | string>[];
  sparkKey?: string;
  syncId?: string;
  hint?: string;
  onExplain?: () => void;
  explaining?: boolean;
  explanation?: string | null;
  explainError?: string | null;
  leading?: ReactNode;
}) {
  const accent = ACCENT[color] ?? ACCENT.emerald;
  const hasSpark = Boolean(spark && spark.length > 1);

  return (
    <Box className="stat-card">
      <Box className="stat-card-body" p="lg" pb={hasSpark ? 0 : "lg"}>
        <Group justify="space-between" align="center" wrap="nowrap" className={classes.head}>
          <Group gap={6} wrap="nowrap" className={classes.labelGroup}>
            {leading}
            <Icon size={14} className={classes.icon} />
            <Text size="xs" c="dimmed" fw={500} truncate className={classes.label}>
              {label}
            </Text>
            {hint && (
              <Tooltip label={hint} multiline w={240} withArrow events={{ hover: true, focus: true, touch: true }}>
                <Info size={12} className={`stat-hint ${classes.hint}`} />
              </Tooltip>
            )}
          </Group>
          <Group gap={6} wrap="nowrap" className={classes.actions}>
            {live ? (
              <span className="live-badge">
                <span className="live-badge__dot" aria-hidden />
                live
              </span>
            ) : delta !== undefined ? (
              <StatDelta delta={delta} inverse={inverseDelta} comparison={comparison} />
            ) : null}
            {onExplain && (
              <StatExplain
                onExplain={onExplain}
                explaining={explaining}
                explanation={explanation}
                explainError={explainError}
              />
            )}
          </Group>
        </Group>

        <Text
          className={`stat-card-value ${classes.value}`}
          fw={700}
          data-live={live || undefined}
          data-accent={color}
        >
          <StatValue value={value} />
        </Text>
      </Box>

      {hasSpark && spark && (
        <StatSpark
          data={spark}
          dataKey={sparkKey}
          accent={accent}
          syncId={syncId}
          id={`spark-${String(label).replace(/\W/g, "")}`}
        />
      )}
    </Box>
  );
}
