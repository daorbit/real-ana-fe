import { Badge, Box, Card, Center, Group, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { Sparkles } from "lucide-react";
import type { SeoIssue, SeoPerformance } from "../../../types";
import { ScoreRing } from "../ScoreRing";
import { SEVERITY } from "../shared/Panel";

/** The full issue list — one severity-railed card per finding. */
export function IssueList({ issues }: { issues: SeoIssue[] }) {
  if (!issues.length) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Stack align="center" gap="xs" maw={380}>
            <ThemeIcon size={48} radius="xl" variant="light" color="teal">
              <Sparkles size={24} />
            </ThemeIcon>
            <Text fw={650}>Nothing to fix</Text>
            <Text size="sm" c="dimmed" ta="center">
              Every on-page check this audit runs came back clean. Nice work.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  return (
    <Stack gap="xs">
      {issues.map((issue, i) => {
        const s = SEVERITY[issue.severity];
        const Icon = s.icon;
        return (
          <Box
            key={`${issue.title}-${i}`}
            className="seo-issue"
            p="md"
            style={{ "--seo-rail": s.rail } as React.CSSProperties}
          >
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <ThemeIcon size={28} radius="md" variant="light" color={s.color}>
                <Icon size={15} />
              </ThemeIcon>
              <div style={{ minWidth: 0, flex: 1 }}>
                <Group gap={8} wrap="wrap" mb={3}>
                  <Text size="sm" fw={600}>
                    {issue.title}
                  </Text>
                  <Badge size="xs" variant="light" color={s.color}>
                    {s.label}
                  </Badge>
                  <Badge size="xs" variant="default" tt="capitalize">
                    {issue.area}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed" lh={1.55}>
                  {issue.detail}
                </Text>
              </div>
            </Group>
          </Box>
        );
      })}
    </Stack>
  );
}

/**
 * The headline band: the overall score on the left as the one figure to read
 * first, the four Lighthouse categories beside it.
 *
 * Kept for the print and public report views; the in-app Overview tab uses the
 * bento hero instead.
 */
export function ScorePanel({
  score,
  performance,
  issues,
  trend,
}: {
  score: number;
  performance: SeoPerformance;
  issues: SeoIssue[];
  /** Score-over-time chart, when there is more than one run to compare. */
  trend?: React.ReactNode;
}) {
  const critical = issues.filter((i) => i.severity === "critical").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const notes = issues.filter((i) => i.severity === "info").length;

  return (
    <Box className="seo-hero">
      <Box className="seo-hero-inner">
        <Group gap={0} align="stretch" wrap="wrap">
          <Box p="xl" style={{ flex: "1 1 260px", minWidth: 240 }}>
            <Stack align="center" gap="md">
              <Text className="seo-eyebrow" ta="center">
                Audit summary
              </Text>
              <ScoreRing label="Overall score" score={score} size={172} hero />
              <Group gap={6} justify="center">
                {critical > 0 && (
                  <Badge size="sm" variant="light" color="red">
                    {critical} critical
                  </Badge>
                )}
                {warnings > 0 && (
                  <Badge size="sm" variant="light" color="yellow">
                    {warnings} warning{warnings === 1 ? "" : "s"}
                  </Badge>
                )}
                {notes > 0 && (
                  <Badge size="sm" variant="light" color="blue">
                    {notes} suggestion{notes === 1 ? "" : "s"}
                  </Badge>
                )}
                {issues.length === 0 && (
                  <Badge size="sm" variant="light" color="teal">
                    No issues
                  </Badge>
                )}
              </Group>
              {trend && <Box w="100%">{trend}</Box>}
            </Stack>
          </Box>

          <Box className="seo-hero-split" p="xl" style={{ flex: "2 1 420px", minWidth: 280 }}>
            <Group justify="space-between" mb="lg" wrap="nowrap">
              <Text className="seo-eyebrow">Lighthouse categories</Text>
              {/* Old reports predate the Lighthouse integration and stored no
                  scores. Say that plainly instead of leaving four blank rings. */}
              {!performance.available && (
                <Badge size="xs" variant="light" color="gray">
                  Re-run for scores
                </Badge>
              )}
            </Group>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
              <ScoreRing
                label="SEO"
                score={performance.scores.seo}
                hint="Crawlability, meta tags, link text and mobile friendliness."
              />
              <ScoreRing
                label="Performance"
                score={performance.scores.performance}
                hint="Load speed and Core Web Vitals, measured on the mobile profile Google indexes with."
              />
              <ScoreRing
                label="Accessibility"
                score={performance.scores.accessibility}
                hint="Contrast, labels, landmarks and other assistive-technology checks."
              />
              <ScoreRing
                label="Best practices"
                score={performance.scores.bestPractices}
                hint="Security, deprecated APIs and console errors."
              />
            </SimpleGrid>
          </Box>
        </Group>
      </Box>
    </Box>
  );
}
