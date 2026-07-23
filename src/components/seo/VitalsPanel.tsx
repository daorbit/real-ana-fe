import {
  Alert, Badge, Box, Card, Group, ScrollArea, SimpleGrid, Table, Text, ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { Activity, Info, Users } from "lucide-react";
import type { SeoFieldVitals, SeoVitalKey, SeoVitalSummary } from "../../types";
import { num } from "../../utils";

/**
 * Core Web Vitals from real visitors.
 *
 * Shown beside the Lighthouse numbers rather than instead of them: Lighthouse
 * is a lab test on synthetic hardware and this is what actually happened on
 * real devices. Where they disagree, the field data is what Google ranks on —
 * and the disagreement is itself worth seeing.
 */

const METRICS: {
  key: SeoVitalKey;
  label: string;
  hint: string;
  unit: "ms" | "s" | "";
}[] = [
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
    hint: "First Contentful Paint — when anything first appeared. Good ≤ 1.8s.",
    unit: "s",
  },
  {
    key: "ttfb",
    label: "TTFB",
    hint: "Time to First Byte — server response time. Good ≤ 800ms.",
    unit: "ms",
  },
];

const RATING_COLOR: Record<SeoVitalSummary["rating"], string> = {
  good: "teal",
  "needs-improvement": "yellow",
  poor: "red",
  none: "gray",
};

const RATING_LABEL: Record<SeoVitalSummary["rating"], string> = {
  good: "Good",
  "needs-improvement": "Needs work",
  poor: "Poor",
  none: "No data",
};

function format(value: number | null, unit: "ms" | "s" | ""): string {
  if (value === null) return "—";
  if (unit === "s") return `${(value / 1000).toFixed(2)}s`;
  if (unit === "ms") return `${Math.round(value)}ms`;
  return value.toFixed(3);
}

export function VitalsPanel({ vitals }: { vitals?: SeoFieldVitals }) {
  if (!vitals) return null;

  // Two different empty states with two different fixes: an out-of-date script
  // needs re-copying, while a current one just needs visitors.
  const needsUpgrade = vitals.trackerVersion < vitals.requiredVersion;

  if (vitals.samples === 0) {
    return (
      <Card withBorder radius="md" padding="lg">
        <Group gap="sm" mb="md">
          <ThemeIcon size={32} radius="md" variant="light" color="grape">
            <Activity size={16} />
          </ThemeIcon>
          <div>
            <Text fw={650} size="sm">
              Real-user vitals
            </Text>
            <Text size="xs" c="dimmed">
              Core Web Vitals as your visitors actually experienced them.
            </Text>
          </div>
        </Group>

        <Alert
          color={needsUpgrade ? "yellow" : "gray"}
          variant="light"
          radius="md"
          icon={<Info size={15} />}
        >
          {needsUpgrade ? (
            <>
              <Text size="sm" fw={600} mb={4}>
                Your tracking snippet is out of date
              </Text>
              <Text size="sm">
                This site reports tracker v{vitals.trackerVersion}, and real-user vitals need
                v{vitals.requiredVersion}. Re-copy the snippet from the site&apos;s settings —
                data starts arriving as soon as visitors load the new script.
              </Text>
            </>
          ) : (
            <>
              <Text size="sm" fw={600} mb={4}>
                No measurements yet
              </Text>
              <Text size="sm">
                Your tracker is current, so vitals will appear once real visitors have
                loaded the page. Unlike a Lighthouse audit, this needs actual traffic.
              </Text>
            </>
          )}
        </Alert>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group gap="sm">
          <ThemeIcon size={32} radius="md" variant="light" color="grape">
            <Activity size={16} />
          </ThemeIcon>
          <div>
            <Text fw={650} size="sm">
              Real-user vitals
            </Text>
            <Text size="xs" c="dimmed">
              75th percentile over {vitals.days} days — the figure Google judges.
            </Text>
          </div>
        </Group>
        <Tooltip label="Page loads carrying at least one measurement" withArrow>
          <Badge size="sm" variant="light" color="grape" leftSection={<Users size={11} />}>
            {num(vitals.samples)}
          </Badge>
        </Tooltip>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="md" mb="lg">
        {METRICS.map((m) => {
          const s = vitals.metrics[m.key];
          const color = RATING_COLOR[s.rating];
          return (
            <Tooltip key={m.key} label={m.hint} withArrow multiline w={250}>
              <Box className="seo-tile" p="md" style={{ cursor: "help" }}>
                <Group justify="space-between" mb={6} wrap="nowrap">
                  <Text size="xs" fw={700} c="dimmed">
                    {m.label}
                  </Text>
                  <Badge size="xs" variant="light" color={color}>
                    {RATING_LABEL[s.rating]}
                  </Badge>
                </Group>
                <Text fz={22} fw={750} lh={1.15} style={{ letterSpacing: "-0.02em" }}>
                  {format(s.p75, m.unit)}
                </Text>
                {s.samples > 0 && (
                  <>
                    <Group gap={0} mt={8} wrap="nowrap" style={{ height: 4 }}>
                      <Box
                        style={{
                          width: `${s.good}%`,
                          background: "var(--mantine-color-teal-6)",
                          height: "100%",
                          borderRadius: "2px 0 0 2px",
                        }}
                      />
                      <Box
                        style={{
                          width: `${s.needsImprovement}%`,
                          background: "var(--mantine-color-yellow-6)",
                          height: "100%",
                        }}
                      />
                      <Box
                        style={{
                          width: `${s.poor}%`,
                          background: "var(--mantine-color-red-6)",
                          height: "100%",
                          borderRadius: "0 2px 2px 0",
                        }}
                      />
                    </Group>
                    <Text size="xs" c="dimmed" mt={4}>
                      {s.good}% good · {num(s.samples)} samples
                    </Text>
                  </>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </SimpleGrid>

      {vitals.byPage.length > 0 && (
        <>
          <Text size="xs" fw={650} c="dimmed" tt="uppercase" mb="sm" style={{ letterSpacing: "0.05em" }}>
            Slowest pages
          </Text>
          <ScrollArea.Autosize mah={280}>
            <Table verticalSpacing="xs" fz="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Page</Table.Th>
                  <Table.Th w={90}>LCP</Table.Th>
                  <Table.Th w={80}>CLS</Table.Th>
                  <Table.Th w={80}>Samples</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {vitals.byPage.map((p) => (
                  <Table.Tr key={p.path}>
                    <Table.Td style={{ maxWidth: 260 }}>
                      <Text size="xs" truncate>
                        {p.path}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        size="sm"
                        variant="light"
                        color={p.lcp === null ? "gray" : p.lcp <= 2500 ? "teal" : p.lcp <= 4000 ? "yellow" : "red"}
                      >
                        {format(p.lcp, "s")}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {format(p.cls, "")}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {num(p.samples)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea.Autosize>
        </>
      )}
    </Card>
  );
}
