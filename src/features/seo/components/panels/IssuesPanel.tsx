import { useMemo, useState } from "react";
import {
  Anchor, Badge, Box, Card, Group, ScrollArea, SegmentedControl, Stack, Table, Text, ThemeIcon,
} from "@mantine/core";
import { CircleCheck } from "lucide-react";
import type { SeoReportData } from "@/shared/types";
import { SEVERITY } from "@/features/seo/components/shared/Panel";
import { EmptyState } from "@/shared/ui/EmptyState";

type Severity = "critical" | "warning" | "info";

type Row = {
  severity: Severity;
  source: string;
  title: string;
  detail: string;
  url?: string;
};

const ORDER: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

type Filter = "all" | Severity;

export function collectIssues(data: SeoReportData): Row[] {
  const rows: Row[] = [];

  for (const issue of data.issues) {
    rows.push({
      severity: issue.severity,
      source: issue.area,
      title: issue.title,
      detail: issue.detail,
    });
  }

  // Link checker. Only the failures — an OK link is not an issue, and the
  // Links tab already lists the full set.
  for (const link of data.links?.results ?? []) {
    if (link.status === "ok" || link.status === "skipped" || link.status === "blocked") continue;
    const title =
      link.status === "broken"
        ? "Broken link"
        : link.status === "server-error"
        ? "Link returns a server error"
        : link.status === "timeout"
        ? "Link timed out"
        : "Link redirects";
    rows.push({
      // A redirect still resolves, so it is a note, not a failure.
      severity:
        link.status === "redirect" ? "info" : link.status === "timeout" ? "warning" : "critical",
      source: "links",
      title,
      detail: [
        link.text ? `"${link.text}"` : null,
        link.statusCode ? `HTTP ${link.statusCode}` : null,
        link.internal ? "internal" : "external",
        link.note,
      ]
        .filter(Boolean)
        .join(" · "),
      url: link.url,
    });
  }

  for (const finding of data.schema?.findings ?? []) {
    rows.push({
      severity: finding.severity === "error" ? "critical" : "warning",
      source: "schema",
      title: `${finding.type}${finding.property ? ` · ${finding.property}` : ""}`,
      detail: finding.message,
    });
  }

  for (const finding of data.siteFiles?.robotsReport?.findings ?? []) {
    rows.push({
      severity: finding.severity,
      source: "robots.txt",
      title: finding.line ? `robots.txt line ${finding.line}` : "robots.txt",
      detail: finding.message,
    });
  }

  for (const finding of data.siteFiles?.sitemapReport?.findings ?? []) {
    rows.push({
      severity: finding.severity,
      source: "sitemap",
      title: "Sitemap",
      detail: finding.message,
    });
  }

  for (const finding of data.aiSearch?.findings ?? []) {
    rows.push({
      severity: finding.severity,
      source: "ai",
      title: "AI search",
      detail: finding.message,
    });
  }

  for (const s of data.performance?.suggestions ?? []) {
    rows.push({
      severity: s.score < 0.5 ? "warning" : "info",
      source: s.category || "performance",
      title: s.title,
      detail: [s.displayValue, s.description].filter(Boolean).join(" — "),
    });
  }

  return rows;
}


export function IssuesPanel({ data }: { data: SeoReportData }) {
  const [filter, setFilter] = useState<Filter>("all");

  const all = useMemo(() => collectIssues(data), [data]);

  const counts = useMemo(
    () => ({
      all: all.length,
      critical: all.filter((i) => i.severity === "critical").length,
      warning: all.filter((i) => i.severity === "warning").length,
      info: all.filter((i) => i.severity === "info").length,
    }),
    [all]
  );

  const rows = useMemo(() => {
    const list = filter === "all" ? all : all.filter((i) => i.severity === filter);
    return [...list].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  }, [all, filter]);

  if (!all.length) {
    return (
      <EmptyState
        compact
        icon={CircleCheck}
        title="No issues found"
        description="Every check this audit runs came back clean."
      />
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap={6}>
          <Text size="sm" fw={600}>
            {counts.all} issue{counts.all === 1 ? "" : "s"}
          </Text>
          {counts.critical > 0 && (
            <Badge size="sm" variant="light" color="red">
              {counts.critical} critical
            </Badge>
          )}
          {counts.warning > 0 && (
            <Badge size="sm" variant="light" color="yellow">
              {counts.warning} warning{counts.warning === 1 ? "" : "s"}
            </Badge>
          )}
          {counts.info > 0 && (
            <Badge size="sm" variant="light" color="blue">
              {counts.info} note{counts.info === 1 ? "" : "s"}
            </Badge>
          )}
        </Group>

        <SegmentedControl
          size="xs"
          radius="md"
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          data={[
            { value: "all", label: `All (${counts.all})` },
            { value: "critical", label: `Critical (${counts.critical})` },
            { value: "warning", label: `Warnings (${counts.warning})` },
            { value: "info", label: `Notes (${counts.info})` },
          ]}
        />
      </Group>

      {!rows.length ? (
        <EmptyState
          compact
          icon={CircleCheck}
          title="Nothing at this severity"
          description="Switch the filter to see the rest of the findings."
        />
      ) : (
        <Card withBorder radius="md" padding={0}>
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm" miw={720}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={52}>#</Table.Th>
                  <Table.Th w={124}>Severity</Table.Th>
                  <Table.Th w={124}>Source</Table.Th>
                  <Table.Th>Issue</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row, i) => {
                  const s = SEVERITY[row.severity];
                  const Icon = s.icon;
                  return (
                    <Table.Tr key={`${row.source}-${row.title}-${i}`}>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {i + 1}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={6} wrap="nowrap">
                          <ThemeIcon size={20} radius="sm" variant="light" color={s.color}>
                            <Icon size={12} />
                          </ThemeIcon>
                          <Text size="xs" fw={550} c={s.color}>
                            {s.label}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="xs" variant="default" tt="capitalize">
                          {row.source}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Box style={{ minWidth: 0 }}>
                          <Text size="sm" fw={600}>
                            {row.title}
                          </Text>
                          {row.detail && (
                            <Text size="xs" c="dimmed" lh={1.5}>
                              {row.detail}
                            </Text>
                          )}
                          {row.url && (
                            <Anchor
                              href={row.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="xs"
                              truncate
                              maw={420}
                              display="block"
                            >
                              {row.url}
                            </Anchor>
                          )}
                        </Box>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      )}
    </Stack>
  );
}
