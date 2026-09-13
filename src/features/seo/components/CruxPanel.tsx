import { Badge, Box, Card, Group, Progress, SimpleGrid, Text, Tooltip } from "@mantine/core";
import { Globe, Info } from "lucide-react";
import type { CruxMetric, CruxVitals } from "@/shared/types";


const METRICS: { key: keyof CruxVitals["metrics"]; label: string; hint: string; unit: "ms" | "s" | "" }[] = [
  {
    key: "lcp",
    label: "LCP",
    hint: "Largest Contentful Paint — when the main content finished rendering. Good ≤ 2.5s.",
    unit: "s",
  },
  {
    key: "inp",
    label: "INP",
    hint: "Interaction to Next Paint — how quickly the page responds to a tap or click. Good ≤ 200ms.",
    unit: "ms",
  },
  {
    key: "cls",
    label: "CLS",
    hint: "Cumulative Layout Shift — how much the page jumps around while loading. Good ≤ 0.1.",
    unit: "",
  },
  {
    key: "fcp",
    label: "FCP",
    hint: "First Contentful Paint — when the first text or image appeared. Good ≤ 1.8s.",
    unit: "s",
  },
  {
    key: "ttfb",
    label: "TTFB",
    hint: "Time to First Byte — how long the server took to start responding. Good ≤ 0.8s.",
    unit: "s",
  },
];

const BAND = {
  FAST: { color: "teal", label: "Passing" },
  AVERAGE: { color: "yellow", label: "Needs work" },
  SLOW: { color: "red", label: "Failing" },
  NONE: { color: "gray", label: "No data" },
} as const;

function format(value: number | null, unit: "ms" | "s" | ""): string {
  if (value === null) return "—";
  if (unit === "s") return `${(value / 1000).toFixed(2)} s`;
  if (unit === "ms") return `${Math.round(value)} ms`;
  return value.toFixed(3);
}

function MetricCard({
  label,
  hint,
  unit,
  metric,
}: {
  label: string;
  hint: string;
  unit: "ms" | "s" | "";
  metric: CruxMetric | null;
}) {
  const band = BAND[metric?.category ?? "NONE"];

  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" wrap="nowrap" mb={6}>
        <Tooltip label={hint} withArrow multiline w={260}>
          <Group gap={4} wrap="nowrap" style={{ cursor: "help" }}>
            <Text size="xs" fw={600} c="dimmed">
              {label}
            </Text>
            <Info size={11} className="sect-ic" />
          </Group>
        </Tooltip>
        <Badge size="xs" variant="light" color={band.color}>
          {band.label}
        </Badge>
      </Group>

      <Text fw={700} fz={22} lh={1.1}>
        {format(metric?.p75 ?? null, unit)}
      </Text>
      <Text size="xs" c="dimmed" mt={2}>
        75th percentile
      </Text>

      {/* The distribution matters as much as the headline: a page can pass at
          p75 while a quarter of visits are still in the poor band. */}
      {metric && (
        <Box mt="sm">
          <Progress.Root size={6}>
            <Progress.Section value={metric.good} color="teal" />
            <Progress.Section value={metric.needsImprovement} color="yellow" />
            <Progress.Section value={metric.poor} color="red" />
          </Progress.Root>
          <Group justify="space-between" mt={5}>
            <Text size="xs" c="teal">
              {metric.good}% good
            </Text>
            <Text size="xs" c="red">
              {metric.poor}% poor
            </Text>
          </Group>
        </Box>
      )}
    </Card>
  );
}

export function CruxPanel({ crux }: { crux?: CruxVitals }) {
  if (!crux?.available) return null;

  const band = BAND[crux.overall];

  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
          <Globe size={15} className="sect-ic" />
          <Text fw={600} size="sm" truncate>
            Chrome real-user data
          </Text>
          <Badge size="xs" variant="light" color={band.color}>
            {band.label}
          </Badge>
        </Group>
        <Badge size="xs" variant="light" color="gray">
          {crux.scope === "url" ? "This page" : "Whole site"}
        </Badge>
      </Group>

      <Text size="xs" c="dimmed" mb="md">
        {crux.scope === "url"
          ? "How this page performed for real Chrome visitors over the last 28 days. This is the data Google ranks on."
          : "Chrome has too few visits to report on this page alone, so these are site-wide figures over the last 28 days. This is the data Google ranks on."}
      </Text>

      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="sm">
        {METRICS.map((m) => (
          <MetricCard
            key={m.key}
            label={m.label}
            hint={m.hint}
            unit={m.unit}
            metric={crux.metrics[m.key]}
          />
        ))}
      </SimpleGrid>
    </Card>
  );
}
