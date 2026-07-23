import { useState } from "react";
import {
  Alert, Badge, Box, Button, Card, Center, Code, Group, ScrollArea, SimpleGrid,
  Stack, Table, Text, ThemeIcon, Tooltip,
} from "@mantine/core";
import {
  AlertTriangle, CheckCircle2, FileStack, Info, Play, Layers, XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SeoCrawlReport, SeoCrawlPage } from "../../types";
import { scoreColor } from "./ScoreRing";
import { num, timeAgo } from "../../utils";

const SEVERITY = {
  critical: { color: "red", icon: XCircle },
  warning: { color: "yellow", icon: AlertTriangle },
  info: { color: "blue", icon: Info },
} as const;

/**
 * Site-wide crawl results.
 *
 * Findings come first and the page table second: the point of crawling is the
 * cross-page problems — duplicate titles, orphaned sections — that no
 * single-page audit can see. The per-page table is supporting evidence.
 */
export function CrawlPanel({
  report,
  running,
  onCrawl,
}: {
  report?: SeoCrawlReport;
  running: boolean;
  onCrawl: () => void;
}) {
  const [showAll, setShowAll] = useState(false);

  if (!report) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Stack align="center" gap="sm" maw={460}>
            <ThemeIcon size={48} radius="xl" variant="light" color="emerald">
              <Layers size={24} />
            </ThemeIcon>
            <Text fw={650}>No crawl yet</Text>
            <Text size="sm" c="dimmed" ta="center">
              A crawl reads your sitemap and checks up to 30 pages at once, finding the
              problems a single-page audit cannot see — duplicate titles, thin pages, and
              URLs in your sitemap that no longer load.
            </Text>
            <Button
              color="emerald"
              radius="md"
              leftSection={<Play size={15} />}
              loading={running}
              onClick={onCrawl}
              mt="xs"
            >
              Crawl this site
            </Button>
            <Text size="xs" c="dimmed" ta="center">
              Takes a few seconds. Lighthouse is not run per page, so this costs no
              PageSpeed quota.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  const { data } = report;
  const pages = showAll ? data.pages : data.pages.slice(0, 12);

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Text size="xs" c="dimmed">
          Crawled {timeAgo(report.createdAt)}
        </Text>
        <Button
          size="xs"
          variant="light"
          color="emerald"
          radius="md"
          leftSection={<Play size={13} />}
          loading={running}
          onClick={onCrawl}
        >
          Crawl again
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <Tile
          label="Average score"
          value={String(data.score)}
          icon={CheckCircle2}
          color={scoreColor(data.score)}
        />
        <Tile label="Pages crawled" value={num(data.crawled)} icon={FileStack} color="cyan" />
        <Tile
          label="In sitemap"
          value={num(data.discovered)}
          icon={Layers}
          color="grape"
        />
        <Tile
          label="Findings"
          value={num(data.findings.length)}
          icon={AlertTriangle}
          color={data.findings.length ? "yellow" : "teal"}
        />
      </SimpleGrid>

      {data.findings.length ? (
        <Stack gap="xs">
          {data.findings.map((f, i) => {
            const s = SEVERITY[f.severity];
            const Icon = s.icon;
            return (
              <Card key={i} withBorder radius="md" padding="md">
                <Group gap="sm" align="flex-start" wrap="nowrap">
                  <ThemeIcon size={28} radius="md" variant="light" color={s.color}>
                    <Icon size={15} />
                  </ThemeIcon>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Text size="sm" fw={600} mb={2}>
                      {f.title}
                    </Text>
                    <Text size="xs" c="dimmed" lh={1.55}>
                      {f.detail}
                    </Text>
                    {f.pages.length > 0 && (
                      <Group gap={4} mt={8} wrap="wrap">
                        {f.pages.map((p) => (
                          <Code key={p} fz="xs">
                            {p}
                          </Code>
                        ))}
                      </Group>
                    )}
                  </div>
                </Group>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Alert color="teal" variant="light" radius="md" icon={<CheckCircle2 size={16} />}>
          No site-wide problems found across {data.crawled} pages — no duplicate titles, no
          thin content, and every sitemap URL loads.
        </Alert>
      )}

      <Card withBorder radius="md" padding={0}>
        <Group justify="space-between" p="md" wrap="nowrap">
          <Text fw={650} size="sm">
            Pages
          </Text>
          {data.pages.length > 12 && (
            <Button size="xs" variant="subtle" color="gray" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show fewer" : `Show all ${data.pages.length}`}
            </Button>
          )}
        </Group>
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="xs" fz="xs" miw={700}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Path</Table.Th>
                <Table.Th w={60}>Status</Table.Th>
                <Table.Th w={70}>Title</Table.Th>
                <Table.Th w={70}>Desc</Table.Th>
                <Table.Th w={50}>H1</Table.Th>
                <Table.Th w={70}>Words</Table.Th>
                <Table.Th w={70}>Schema</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pages.map((p) => (
                <PageRow key={p.url} page={p} />
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
    </Stack>
  );
}

function PageRow({ page }: { page: SeoCrawlPage }) {
  const bad = page.statusCode >= 400 || Boolean(page.error);

  return (
    <Table.Tr>
      <Table.Td style={{ maxWidth: 260 }}>
        <Group gap={5} wrap="nowrap">
          <Text size="xs" truncate>
            {page.path}
          </Text>
          {page.noindex && (
            <Tooltip label="This page tells search engines not to index it" withArrow>
              <Badge size="xs" variant="light" color="red">
                noindex
              </Badge>
            </Tooltip>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge size="xs" variant="light" color={bad ? "red" : "teal"}>
          {page.error ? "err" : page.statusCode}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Len value={page.titleLength} min={30} max={60} />
      </Table.Td>
      <Table.Td>
        <Len value={page.descriptionLength} min={70} max={160} />
      </Table.Td>
      <Table.Td>
        <Text size="xs" c={page.h1Count === 1 ? "dimmed" : "yellow"} fw={page.h1Count === 1 ? 400 : 600}>
          {page.h1Count}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c={page.wordCount < 300 ? "yellow" : "dimmed"}>
          {num(page.wordCount)}
        </Text>
      </Table.Td>
      <Table.Td>
        {page.hasSchema ? (
          <CheckCircle2 size={13} color="var(--mantine-color-teal-5)" />
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
    </Table.Tr>
  );
}

/** A character count coloured against the band search results display. */
function Len({ value, min, max }: { value: number; min: number; max: number }) {
  const color = value === 0 ? "red" : value >= min && value <= max ? "dimmed" : "yellow";
  return (
    <Text size="xs" c={color} fw={color === "dimmed" ? 400 : 600}>
      {value || "—"}
    </Text>
  );
}

function Tile({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <Box className="seo-tile" p="md">
      <ThemeIcon size={30} radius="md" variant="light" color={color} mb="sm">
        <Icon size={15} />
      </ThemeIcon>
      <Text fz={26} fw={750} lh={1.1} style={{ letterSpacing: "-0.03em" }}>
        {value}
      </Text>
      <Text size="xs" c="dimmed" mt={2} truncate>
        {label}
      </Text>
    </Box>
  );
}
