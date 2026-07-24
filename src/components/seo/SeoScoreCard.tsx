import { Link } from "react-router-dom";
import {
  Card, Group, Stack, Text, Badge, Button, Center, ThemeIcon, Skeleton, Box, Tooltip,
} from "@mantine/core";
import { ArrowUpRight, Search, Sparkles, Gauge } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetLatestSeoReportQuery } from "../../store";
import { ScoreRing, scoreColor } from "./ScoreRing";
import { timeAgo } from "../../utils";

/**
 * Home-page glance at the most recent SEO audit for one site.
 *
 * The full audit lives on the SEO page; this is the "is it still fine?" card —
 * the overall score, the counts that would send you there, and a link. It owns
 * its own fetch so the Home grid can drop it in like any other widget without
 * threading a per-site query through the page.
 */
export function SeoScoreCard({
  workspaceId,
  siteId,
  siteName,
}: {
  workspaceId: string;
  /** Empty when the workspace has no sites — the card shows the add-a-site path. */
  siteId: string;
  siteName?: string;
}) {
  const { data: report, isLoading } = useGetLatestSeoReportQuery(
    workspaceId && siteId ? { workspaceId, siteId } : skipToken
  );

  const Frame = ({ children }: { children: React.ReactNode }) => (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
          <Gauge size={15} className="sect-ic" />
          <Text fw={600} c="dimmed" size="sm" truncate>
            SEO health
          </Text>
        </Group>
        <Button
          component={Link}
          to="/app/seo"
          variant="subtle"
          size="xs"
          rightSection={<ArrowUpRight size={14} />}
        >
          Audit
        </Button>
      </Group>
      {children}
    </Card>
  );

  if (isLoading) {
    return (
      <Frame>
        <Center py="md">
          <Skeleton height={92} circle />
        </Center>
      </Frame>
    );
  }

  // No audit stored yet (or the workspace has no sites at all) — point at the
  // one action that fills this card in.
  if (!report?.data) {
    return (
      <Frame>
        <Center mih={150}>
          <Stack align="center" gap={8} maw={240}>
            <ThemeIcon size={40} radius="xl" variant="light" color="emerald">
              <Sparkles size={19} />
            </ThemeIcon>
            <Text fw={600} size="sm" ta="center">
              No audit yet
            </Text>
            <Text c="dimmed" size="xs" ta="center">
              Run an SEO audit to see this site's score at a glance.
            </Text>
            <Button
              component={Link}
              to="/app/seo"
              size="xs"
              variant="light"
              color="emerald"
              mt={4}
              leftSection={<Search size={13} />}
            >
              Run an audit
            </Button>
          </Stack>
        </Center>
      </Frame>
    );
  }

  const { data } = report;
  const critical = data.issues.filter((i) => i.severity === "critical").length;
  const warnings = data.issues.filter((i) => i.severity === "warning").length;
  const color = scoreColor(data.score);

  return (
    <Frame>
      <Group align="center" gap="lg" wrap="nowrap">
        <ScoreRing label="" score={data.score} size={104} />
        <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={6} wrap="wrap">
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
            {critical === 0 && warnings === 0 && (
              <Badge size="sm" variant="light" color="teal">
                No blockers
              </Badge>
            )}
          </Group>
          {data.performance.available && (
            <Group gap="md" wrap="wrap">
              <MiniScore label="Perf" score={data.performance.scores.performance} />
              <MiniScore label="A11y" score={data.performance.scores.accessibility} />
              <MiniScore label="Best" score={data.performance.scores.bestPractices} />
            </Group>
          )}
          <Box>
            {siteName && (
              <Text size="xs" c="dimmed" truncate>
                {siteName}
              </Text>
            )}
            <Text size="xs" c={color === "gray" ? "dimmed" : color} fw={500}>
              Audited {timeAgo(report.createdAt)}
            </Text>
          </Box>
        </Stack>
      </Group>
    </Frame>
  );
}

/** A single Lighthouse sub-score as a coloured dot + number, tight enough to sit in a row. */
function MiniScore({ label, score }: { label: string; score: number | null }) {
  const color = scoreColor(score);
  return (
    <Tooltip label={label} withArrow>
      <Group gap={6} wrap="nowrap">
        <Box
          w={7}
          h={7}
          style={{ borderRadius: "50%", background: `var(--mantine-color-${color}-6)` }}
        />
        <Text size="xs" c="dimmed">
          {label} <Text span fw={650} c="var(--mantine-color-text)">{score ?? "—"}</Text>
        </Text>
      </Group>
    </Tooltip>
  );
}
