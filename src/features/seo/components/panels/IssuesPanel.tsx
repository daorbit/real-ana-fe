import { useMemo, useState } from "react";
import {
  Badge, Box, Card, Group, ScrollArea, SegmentedControl, Stack, Table, Text, ThemeIcon,
} from "@mantine/core";
import { CircleCheck } from "lucide-react";
import type { SeoIssue } from "@/shared/types";
import { SEVERITY } from "@/features/seo/components/shared/Panel";
import { EmptyState } from "@/shared/ui/EmptyState";

const ORDER: Record<SeoIssue["severity"], number> = { critical: 0, warning: 1, info: 2 };

type Filter = "all" | SeoIssue["severity"];


export function IssuesPanel({ issues }: { issues: SeoIssue[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () => ({
      all: issues.length,
      critical: issues.filter((i) => i.severity === "critical").length,
      warning: issues.filter((i) => i.severity === "warning").length,
      info: issues.filter((i) => i.severity === "info").length,
    }),
    [issues]
  );

  const rows = useMemo(() => {
    const list = filter === "all" ? issues : issues.filter((i) => i.severity === filter);
    return [...list].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  }, [issues, filter]);

  if (!issues.length) {
    return (
      <EmptyState
        compact
        icon={CircleCheck}
        title="No issues found"
        description="Every on-page check this audit runs came back clean."
      />
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap={6}>
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
              {counts.info} suggestion{counts.info === 1 ? "" : "s"}
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
            <Table highlightOnHover verticalSpacing="sm" miw={640}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={56}>#</Table.Th>
                  <Table.Th w={130}>Severity</Table.Th>
                  <Table.Th w={110}>Area</Table.Th>
                  <Table.Th>Issue</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((issue, i) => {
                  const s = SEVERITY[issue.severity];
                  const Icon = s.icon;
                  return (
                    <Table.Tr key={`${issue.title}-${i}`}>
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
                          {issue.area}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Box style={{ minWidth: 0 }}>
                          <Text size="sm" fw={600}>
                            {issue.title}
                          </Text>
                          <Text size="xs" c="dimmed" lh={1.5}>
                            {issue.detail}
                          </Text>
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
