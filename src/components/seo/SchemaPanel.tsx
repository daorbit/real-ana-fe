import {
  Accordion, Alert, Badge, Box, Card, Center, Code, Group, ScrollArea, Stack,
  Text, ThemeIcon, Divider,
} from "@mantine/core";
import {
  AlertTriangle, Braces, CheckCircle2, FileWarning, Info, XCircle,
} from "lucide-react";
import type { SeoSchemaValidation, SeoSchemaFinding } from "../../types";

/**
 * Structured-data validation results.
 *
 * Errors and warnings are kept visually distinct because they demand different
 * urgency: an error means Google shows no rich result at all, while a warning
 * means it shows a weaker one. Collapsing them into one list would hide that.
 */
export function SchemaPanel({ schema }: { schema?: SeoSchemaValidation }) {
  // Reports stored before the validator shipped have no schema block at all,
  // which is not the same as a page having no structured data.
  if (!schema) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Stack align="center" gap="xs" maw={400}>
            <ThemeIcon size={48} radius="xl" variant="light" color="gray">
              <Braces size={24} />
            </ThemeIcon>
            <Text fw={650}>Not checked on this report</Text>
            <Text size="sm" c="dimmed" ta="center">
              This audit ran before structured-data validation was added. Re-run it to
              check the page&apos;s JSON-LD.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  if (!schema.blocks.length) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Stack align="center" gap="xs" maw={420}>
            <ThemeIcon size={48} radius="xl" variant="light" color="yellow">
              <FileWarning size={24} />
            </ThemeIcon>
            <Text fw={650}>No structured data</Text>
            <Text size="sm" c="dimmed" ta="center">
              This page has no JSON-LD. Adding schema lets search engines show rich
              results — star ratings, breadcrumbs, FAQ accordions — instead of a plain
              blue link.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  const errors = schema.findings.filter((f) => f.severity === "error");
  const warnings = schema.findings.filter((f) => f.severity === "warning");

  return (
    <Stack gap="lg">
      <Card withBorder radius="md" padding="lg">
        <Group justify="space-between" wrap="wrap" gap="md">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon
              size={40}
              radius="md"
              variant="light"
              color={errors.length ? "red" : warnings.length ? "yellow" : "teal"}
            >
              {errors.length ? (
                <XCircle size={20} />
              ) : warnings.length ? (
                <AlertTriangle size={20} />
              ) : (
                <CheckCircle2 size={20} />
              )}
            </ThemeIcon>
            <div>
              <Text fw={650} size="sm">
                {errors.length
                  ? `${errors.length} error${errors.length === 1 ? "" : "s"} blocking rich results`
                  : warnings.length
                  ? "Valid, with room to improve"
                  : "All structured data is valid"}
              </Text>
              <Text size="xs" c="dimmed" mt={1}>
                {schema.blocks.length} block{schema.blocks.length === 1 ? "" : "s"} ·{" "}
                {schema.types.length} type{schema.types.length === 1 ? "" : "s"}
              </Text>
            </div>
          </Group>

          <Group gap={5} wrap="wrap" justify="flex-end">
            {schema.types.map((t) => (
              <Badge key={t} size="sm" variant="light" color="grape">
                {t}
              </Badge>
            ))}
          </Group>
        </Group>

        {schema.blocks.some((b) => !b.valid) && (
          <Alert color="red" variant="light" mt="md" radius="md" icon={<XCircle size={16} />}>
            {schema.blocks.filter((b) => !b.valid).length} block(s) failed to parse as JSON.
            Search engines ignore an invalid block entirely — it is worse than having none,
            because it looks done.
          </Alert>
        )}
      </Card>

      {errors.length > 0 && (
        <FindingGroup
          title="Errors"
          description="Google will not produce a rich result while these are unresolved."
          findings={errors}
          color="red"
          icon={XCircle}
        />
      )}

      {warnings.length > 0 && (
        <FindingGroup
          title="Recommended"
          description="Allowed without these, but the rich result carries less."
          findings={warnings}
          color="yellow"
          icon={AlertTriangle}
        />
      )}

      {!errors.length && !warnings.length && (
        <Alert color="teal" variant="light" radius="md" icon={<CheckCircle2 size={16} />}>
          Every required and recommended property is present on all {schema.types.length}{" "}
          type{schema.types.length === 1 ? "" : "s"}.
        </Alert>
      )}
    </Stack>
  );
}

function FindingGroup({
  title,
  description,
  findings,
  color,
  icon: Icon,
}: {
  title: string;
  description: string;
  findings: SeoSchemaFinding[];
  color: string;
  icon: typeof XCircle;
}) {
  // Grouped by type so a page with one broken Product does not read as ten
  // separate problems.
  const byType = new Map<string, SeoSchemaFinding[]>();
  for (const f of findings) {
    const list = byType.get(f.type) ?? [];
    list.push(f);
    byType.set(f.type, list);
  }

  return (
    <Card withBorder radius="md" padding={0}>
      <Box p="lg" pb="sm">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={32} radius="md" variant="light" color={color}>
            <Icon size={16} />
          </ThemeIcon>
          <div>
            <Text fw={650} size="sm">
              {title}
              <Text span c="dimmed" fw={400}>
                {" "}
                · {findings.length}
              </Text>
            </Text>
            <Text size="xs" c="dimmed" mt={1}>
              {description}
            </Text>
          </div>
        </Group>
      </Box>
      <Divider />
      <Accordion variant="filled" radius={0} multiple defaultValue={[...byType.keys()]}>
        {[...byType.entries()].map(([type, list]) => (
          <Accordion.Item key={type} value={type} style={{ border: 0 }}>
            <Accordion.Control>
              <Group gap={8}>
                <Text size="sm" fw={600}>
                  {type}
                </Text>
                <Badge size="xs" variant="light" color={color}>
                  {list.length}
                </Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xs">
                {list.map((f, i) => (
                  <Group key={i} gap="xs" align="flex-start" wrap="nowrap">
                    {f.property && (
                      <Code fz="xs" style={{ flexShrink: 0 }}>
                        {f.property}
                      </Code>
                    )}
                    <Text size="xs" c="dimmed" lh={1.55}>
                      {f.message}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Card>
  );
}

/**
 * robots.txt and sitemap validation, replacing the old pair of presence ticks.
 *
 * A robots.txt that exists but contains `Disallow: /` used to score as a pass;
 * that case is now the loudest thing on the page.
 */
export function CrawlerFilesPanel({
  robots,
  sitemap,
}: {
  robots?: import("../../types").SeoRobotsReport;
  sitemap?: import("../../types").SeoSitemapReport;
}) {
  if (!robots && !sitemap) return null;

  const sev = (s: "critical" | "warning" | "info") =>
    s === "critical" ? "red" : s === "warning" ? "yellow" : "blue";
  const SevIcon = (s: "critical" | "warning" | "info") =>
    s === "critical" ? XCircle : s === "warning" ? AlertTriangle : Info;

  return (
    <Stack gap="lg">
      {robots?.blocksEverything && (
        <Alert color="red" variant="filled" radius="md" icon={<XCircle size={18} />}>
          <Text fw={700} size="sm" mb={4}>
            This site is blocked from every search engine
          </Text>
          <Text size="sm">
            robots.txt contains <Code>Disallow: /</Code> for all crawlers. Nothing on this
            domain can appear in search results until that rule is removed.
          </Text>
        </Alert>
      )}

      {robots?.blocksAuditedUrl && !robots.blocksEverything && (
        <Alert color="red" variant="light" radius="md" icon={<XCircle size={16} />}>
          robots.txt blocks this specific page, so it cannot be crawled or indexed.
        </Alert>
      )}

      <Card withBorder radius="md" padding="lg">
        <Group justify="space-between" mb="md" wrap="nowrap">
          <Group gap="sm">
            <ThemeIcon
              size={32}
              radius="md"
              variant="light"
              color={robots?.present ? "teal" : "yellow"}
            >
              <Braces size={16} />
            </ThemeIcon>
            <div>
              <Text fw={650} size="sm">
                robots.txt
              </Text>
              <Text size="xs" c="dimmed">
                {robots?.present
                  ? `${robots.groups.length} rule group${
                      robots.groups.length === 1 ? "" : "s"
                    } · ${robots.sitemaps.length} sitemap reference${
                      robots.sitemaps.length === 1 ? "" : "s"
                    }`
                  : "Not found"}
              </Text>
            </div>
          </Group>
          <Badge size="sm" variant="light" color={robots?.present ? "teal" : "yellow"}>
            {robots?.present ? "Present" : "Missing"}
          </Badge>
        </Group>

        {robots?.findings.length ? (
          <Stack gap={6}>
            {robots.findings.map((f, i) => {
              const Icon = SevIcon(f.severity);
              return (
                <Group key={i} gap="xs" align="flex-start" wrap="nowrap">
                  <ThemeIcon size={18} radius="xl" variant="light" color={sev(f.severity)}>
                    <Icon size={10} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed" lh={1.5}>
                    {f.line != null && (
                      <Text span c={sev(f.severity)} fw={600}>
                        Line {f.line}:{" "}
                      </Text>
                    )}
                    {f.message}
                  </Text>
                </Group>
              );
            })}
          </Stack>
        ) : robots?.present ? (
          <Group gap={6}>
            <CheckCircle2 size={14} color="var(--mantine-color-teal-5)" />
            <Text size="xs" c="dimmed">
              No problems found.
            </Text>
          </Group>
        ) : null}

        {robots?.content && (
          <Accordion variant="filled" radius="md" mt="md">
            <Accordion.Item value="raw" style={{ border: 0 }}>
              <Accordion.Control>
                <Text size="xs" fw={600}>
                  View file
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <ScrollArea.Autosize mah={240}>
                  <Code block fz="xs">
                    {robots.content}
                  </Code>
                </ScrollArea.Autosize>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
      </Card>

      <Card withBorder radius="md" padding="lg">
        <Group justify="space-between" mb="md" wrap="nowrap">
          <Group gap="sm">
            <ThemeIcon
              size={32}
              radius="md"
              variant="light"
              color={sitemap?.present ? "teal" : "yellow"}
            >
              <Braces size={16} />
            </ThemeIcon>
            <div>
              <Text fw={650} size="sm">
                Sitemap
              </Text>
              <Text size="xs" c="dimmed">
                {sitemap?.present
                  ? `${sitemap.urlCount.toLocaleString()} URL${
                      sitemap.urlCount === 1 ? "" : "s"
                    }${sitemap.isIndex ? " · sitemap index" : ""}`
                  : "Not found"}
              </Text>
            </div>
          </Group>
          <Badge size="sm" variant="light" color={sitemap?.present ? "teal" : "yellow"}>
            {sitemap?.present ? "Present" : "Missing"}
          </Badge>
        </Group>

        {sitemap?.findings.length ? (
          <Stack gap={6}>
            {sitemap.findings.map((f, i) => {
              const Icon = SevIcon(f.severity);
              return (
                <Group key={i} gap="xs" align="flex-start" wrap="nowrap">
                  <ThemeIcon size={18} radius="xl" variant="light" color={sev(f.severity)}>
                    <Icon size={10} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed" lh={1.5}>
                    {f.message}
                  </Text>
                </Group>
              );
            })}
          </Stack>
        ) : sitemap?.present ? (
          <Group gap={6}>
            <CheckCircle2 size={14} color="var(--mantine-color-teal-5)" />
            <Text size="xs" c="dimmed">
              No problems found.
            </Text>
          </Group>
        ) : null}

        {sitemap?.urls.length ? (
          <Stack gap={2} mt="sm">
            {sitemap.urls.slice(0, 5).map((u) => (
              <Text key={u} size="xs" c="dimmed" truncate>
                {u}
              </Text>
            ))}
          </Stack>
        ) : null}
      </Card>
    </Stack>
  );
}
