import {
  Anchor, Badge, Box, Divider, Group, RingProgress, SimpleGrid, Stack, Text,
} from "@mantine/core";
import {
  Image as ImageIcon, ShieldCheck, Smartphone, Monitor, Share2, Bot, Server, Clock,
  FileText,
} from "lucide-react";
import type { SeoPerformance, SeoSiteFiles, SeoStrategyResult, SeoTechnical } from "../../../types";
import { scoreColor, scoreLabel } from "../ScoreRing";
import { CrawlerFilesPanel } from "../SchemaPanel";
import { Panel, CheckRow } from "../shared/Panel";
import { Tile } from "../shared/Tile";
import { METRIC_ROWS, pageSize } from "../utils";

function MetricsTable({ result }: { result: SeoStrategyResult }) {
  return (
    <Stack gap={0}>
      {METRIC_ROWS.map((row, i) => {
        const v = result.metrics[row.key];
        if (v === null) return null;
        const display =
          row.unit === "s" ? `${(v / 1000).toFixed(1)} s` : row.unit === "ms" ? `${v} ms` : String(v);
        const color = v <= row.good ? "teal" : v <= row.good * 2 ? "yellow" : "red";
        return (
          <Box key={row.key}>
            {i > 0 && <Divider />}
            <Group justify="space-between" py={9} wrap="nowrap">
              <Text size="sm">{row.label}</Text>
              <Badge size="sm" variant="light" color={color}>
                {display}
              </Badge>
            </Group>
          </Box>
        );
      })}
    </Stack>
  );
}

export function TechnicalPanel({
  technical,
  performance,
  siteFiles,
  vitals,
}: {
  technical: SeoTechnical;
  performance: SeoPerformance;
  siteFiles: SeoSiteFiles;
  /** Real-user Core Web Vitals, shown beside the Lighthouse lab numbers. */
  vitals?: React.ReactNode;
}) {
  return (
    <Stack gap="lg">
      {vitals}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Panel
          title="Page checks"
          description="The signals a crawler looks for on every page."
          icon={ShieldCheck}
          color="teal"
        >
          <Stack gap={0}>
            <CheckRow ok={technical.hasHttps} label="Served over HTTPS" />
            <Divider />
            <CheckRow ok={technical.hasMobileViewport} label="Mobile viewport tag" icon={Smartphone} />
            <Divider />
            <CheckRow ok={technical.hasFavicon} label="Favicon" />
            <Divider />
            <CheckRow ok={technical.hasOpenGraph} label="Open Graph tags" icon={Share2} />
            <Divider />
            <CheckRow ok={technical.hasTwitterCards} label="Twitter Card tags" icon={Share2} />
            <Divider />
            <CheckRow ok={technical.hasStructuredData} label="Structured data (JSON-LD)" />
            <Divider />
            <CheckRow
              ok={technical.missingAltImages === 0}
              label="All images have alt text"
              detail={`${technical.imageAltCount} of ${technical.totalImages} images`}
              icon={ImageIcon}
            />
          </Stack>
        </Panel>

        <Stack gap="lg">
          <Panel title="Response" description="What the server sent back." icon={Server} color="cyan">
            <SimpleGrid cols={2} spacing="md" mb="md">
              <Tile
                label="Status code"
                value={String(technical.statusCode)}
                icon={Server}
                tone={technical.statusCode < 300 ? "good" : technical.statusCode < 400 ? "warn" : "bad"}
              />
              <Tile
                label="Response time"
                value={`${technical.responseTimeMs} ms`}
                icon={Clock}
                tone={
                  technical.responseTimeMs < 600
                    ? "good"
                    : technical.responseTimeMs < 1500
                    ? "warn"
                    : "bad"
                }
                hint="Under 600 ms is a reasonable target."
              />
            </SimpleGrid>
            <Stack gap={0}>
              <Group justify="space-between" py={7} wrap="nowrap">
                <Text size="sm">Content type</Text>
                <Text size="xs" c="dimmed" truncate maw={200}>
                  {technical.contentType || "—"}
                </Text>
              </Group>
              <Divider />
              <Group justify="space-between" py={7} wrap="nowrap">
                <Text size="sm">Server</Text>
                <Text size="xs" c="dimmed" truncate maw={200}>
                  {technical.server || "—"}
                </Text>
              </Group>
              <Divider />
              <Group justify="space-between" py={7} wrap="nowrap">
                <Text size="sm">Page size</Text>
                <Text size="xs" c="dimmed">
                  {pageSize(technical.contentLength)}
                </Text>
              </Group>
            </Stack>
          </Panel>

          {/* Reports predating the validator only carry presence flags, so the
              old two-tick view stays as the fallback for those. */}
          {siteFiles.robotsReport || siteFiles.sitemapReport ? (
            <CrawlerFilesPanel
              robots={siteFiles.robotsReport}
              sitemap={siteFiles.sitemapReport}
            />
          ) : (
            <Panel
              title="Crawler files"
              description="How search engines discover the rest of the site."
              icon={Bot}
              color="indigo"
            >
              <Stack gap={0}>
                <CheckRow
                  ok={siteFiles.robotsTxt.present}
                  label="robots.txt"
                  detail={siteFiles.robotsTxt.url}
                  icon={Bot}
                />
                <Divider />
                <CheckRow
                  ok={siteFiles.sitemap.present}
                  label="Sitemap"
                  detail={siteFiles.sitemap.urls[0] ?? "Not referenced in robots.txt or at /sitemap.xml"}
                  icon={FileText}
                />
              </Stack>
              {siteFiles.sitemap.urls.length > 1 && (
                <Stack gap={2} mt="xs" pl={38}>
                  {siteFiles.sitemap.urls.slice(1).map((u) => (
                    <Anchor key={u} href={u} target="_blank" size="xs" truncate>
                      {u}
                    </Anchor>
                  ))}
                </Stack>
              )}
            </Panel>
          )}
        </Stack>
      </SimpleGrid>

      {performance.available && (
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          {(["mobile", "desktop"] as const).map((strategy) => {
            const result = performance[strategy];
            if (!result) return null;
            const perf = result.scores.performance;
            return (
              <Panel
                key={strategy}
                title={strategy === "mobile" ? "Mobile" : "Desktop"}
                description="Core Web Vitals as measured by Lighthouse."
                icon={strategy === "mobile" ? Smartphone : Monitor}
                color={strategy === "mobile" ? "emerald" : "cyan"}
                right={
                  <Group gap={8} wrap="nowrap">
                    <RingProgress
                      size={40}
                      thickness={4}
                      roundCaps
                      sections={[{ value: perf ?? 0, color: scoreColor(perf) }]}
                      label={
                        <Text ta="center" size="xs" fw={700}>
                          {perf ?? "—"}
                        </Text>
                      }
                    />
                    <Text size="xs" c={scoreColor(perf)}>
                      {scoreLabel(perf)}
                    </Text>
                  </Group>
                }
              >
                <MetricsTable result={result} />
              </Panel>
            );
          })}
        </SimpleGrid>
      )}
    </Stack>
  );
}
