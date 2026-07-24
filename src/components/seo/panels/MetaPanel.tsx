import {
  Accordion, Badge, Box, Card, Code, Divider, Group, Progress, ScrollArea,
  SimpleGrid, Stack, Table, Text, ThemeIcon,
} from "@mantine/core";
import { FileSearch, Type, Share2, Globe } from "lucide-react";
import type { SeoMeta } from "../../../types";
import { Panel } from "../shared/Panel";
import { Thumb, FaviconDot } from "../shared/Thumb";

/** Search results truncate; the bar shows how close a field is to the limit. */
function LengthMeter({ value, min, max }: { value: string; min: number; max: number }) {
  const len = value.length;
  const ok = len >= min && len <= max;
  const color = !len ? "red" : ok ? "teal" : "yellow";
  return (
    <Group gap="xs" wrap="nowrap" mt={8}>
      <Progress
        value={Math.min(100, (len / max) * 100)}
        color={color}
        size="sm"
        radius="xl"
        style={{ flex: 1 }}
      />
      <Text size="xs" c={color === "teal" ? "dimmed" : color} fw={500}>
        {len}/{max}
      </Text>
    </Group>
  );
}

function MetaField({
  label,
  value,
  min,
  max,
  preview = false,
}: {
  label: string;
  value: string;
  min?: number;
  max?: number;
  /** Render a thumbnail alongside the value — for tags holding an image URL. */
  preview?: boolean;
}) {
  const body = value ? (
    <Text size="sm" style={{ wordBreak: "break-word" }} lh={1.5}>
      {value}
    </Text>
  ) : (
    <Text size="sm" c="dimmed" fs="italic">
      Not set on this page
    </Text>
  );

  return (
    <Box>
      <Group gap={6} mb={4}>
        <Text size="xs" c="dimmed" fw={650} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
          {label}
        </Text>
        {!value && (
          <Badge size="xs" variant="light" color="red">
            Missing
          </Badge>
        )}
      </Group>
      {preview && value ? (
        <Group gap="sm" align="flex-start" wrap="nowrap">
          <Thumb src={value} alt={label} />
          <Box style={{ minWidth: 0, flex: 1 }}>{body}</Box>
        </Group>
      ) : (
        body
      )}
      {min !== undefined && max !== undefined && <LengthMeter value={value} min={min} max={max} />}
    </Box>
  );
}

/**
 * What the page looks like on a results page. Seeing the truncation is worth
 * more than being told a character count is over the limit.
 */
function SerpPreview({ meta, url }: { meta: SeoMeta; url: string }) {
  const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);
  let host = url;
  let crumbs: string[] = [];
  try {
    const u = new URL(url);
    host = u.hostname.replace(/^www\./, "");
    crumbs = u.pathname.split("/").filter(Boolean);
  } catch {
    /* fall back to the raw string */
  }

  return (
    <Box className="seo-serp">
      <Box className="seo-serp-crumb" mb={8}>
        <Box className="seo-serp-favicon">
          {meta.favicon ? (
            <FaviconDot src={meta.favicon} />
          ) : (
            <Globe size={13} style={{ opacity: 0.5 }} />
          )}
        </Box>
        <div style={{ minWidth: 0 }}>
          <Text size="xs" fw={550} lh={1.2} truncate>
            {host}
          </Text>
          <Text size="xs" c="dimmed" lh={1.2} truncate>
            {host}
            {crumbs.length > 0 && (
              <Text span c="dimmed">
                {" › "}
                {crumbs.join(" › ")}
              </Text>
            )}
          </Text>
        </div>
      </Box>
      <Text className="seo-serp-title" size="lg" fw={500} lh={1.3} mb={4}>
        {clip(meta.title || "Untitled page", 60)}
      </Text>
      <Text size="sm" c="dimmed" lh={1.55}>
        {meta.description
          ? clip(meta.description, 160)
          : "No meta description — search engines will pull a snippet from the page copy instead."}
      </Text>
    </Box>
  );
}

export function MetaPanel({ meta, url }: { meta: SeoMeta; url: string }) {
  return (
    <Stack gap="lg">
      <Panel
        title="Search preview"
        description="Roughly how this page reads on a results page."
        icon={FileSearch}
      >
        <SerpPreview meta={meta} url={url} />
      </Panel>

      <Panel title="Core tags" description="The fields search engines read first." icon={Type}>
        <Stack gap="lg">
          <MetaField label="Title" value={meta.title} min={30} max={60} />
          <Divider />
          <MetaField label="Meta description" value={meta.description} min={120} max={160} />
          <Divider />
          <MetaField label="Canonical URL" value={meta.canonical} />
          <Divider />
          <MetaField label="Keywords" value={meta.keywords} />
          <Divider />
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <MetaField label="Robots" value={meta.robots} />
            <MetaField label="Author" value={meta.author} />
            <MetaField label="Charset" value={meta.charset} />
            <MetaField label="Viewport" value={meta.viewport} />
            <MetaField label="Favicon" value={meta.favicon} />
          </SimpleGrid>
        </Stack>
      </Panel>

      <Panel
        title="Social previews"
        description="What a shared link renders as on social platforms."
        icon={Share2}
        color="blue"
      >
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Stack gap="md">
            <Badge variant="light" color="blue" w="fit-content">
              Open Graph
            </Badge>
            <MetaField label="og:title" value={meta.ogTitle} />
            <MetaField label="og:description" value={meta.ogDescription} />
            <MetaField label="og:image" value={meta.ogImage} preview />
            <MetaField label="og:type" value={meta.ogType} />
            <MetaField label="og:url" value={meta.ogUrl} />
            <MetaField label="og:site_name" value={meta.ogSiteName} />
          </Stack>
          <Stack gap="md">
            <Badge variant="light" color="cyan" w="fit-content">
              Twitter Card
            </Badge>
            <MetaField label="twitter:card" value={meta.twitterCard} />
            <MetaField label="twitter:title" value={meta.twitterTitle} />
            <MetaField label="twitter:description" value={meta.twitterDescription} />
            <MetaField label="twitter:image" value={meta.twitterImage} preview />
            <MetaField label="twitter:site" value={meta.twitterSite} />
          </Stack>
        </SimpleGrid>
      </Panel>

      <Card withBorder radius="md" padding={0}>
        {/* Open by default — the full tag list is the reason someone opens this
            tab, so making them click once more to reach it is friction. */}
        <Accordion variant="filled" radius="md" defaultValue="all">
          <Accordion.Item value="all" style={{ border: 0 }}>
            <Accordion.Control>
              <Group gap="sm">
                <ThemeIcon size={30} radius="md" variant="light" color="gray">
                  <Code style={{ background: "transparent", fontSize: 12 }}>{"<>"}</Code>
                </ThemeIcon>
                <Text size="sm" fw={650}>
                  All meta tags
                  <Text span c="dimmed" fw={400}>
                    {" "}
                    · {meta.allMetaTags.length}
                  </Text>
                </Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <ScrollArea.Autosize mah={360}>
                <Table striped highlightOnHover verticalSpacing="xs" fz="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={200}>Name</Table.Th>
                      <Table.Th>Content</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {meta.allMetaTags.map((t, i) => (
                      <Table.Tr key={`${t.name}-${i}`}>
                        <Table.Td>
                          <Code fz="xs">{t.name}</Code>
                        </Table.Td>
                        <Table.Td style={{ wordBreak: "break-word" }}>{t.content}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea.Autosize>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </Stack>
  );
}
