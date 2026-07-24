import {
  Anchor, Badge, Box, Group, Progress, ScrollArea, SimpleGrid, Stack, Table, Text,
} from "@mantine/core";
import {
  FileText, Image as ImageIcon, Link2, Type, Gauge, ExternalLink, Sparkles,
} from "lucide-react";
import type { SeoContent } from "../../../types";
import { num } from "../../../utils";
import { Panel, Empty } from "../shared/Panel";
import { Tile } from "../shared/Tile";
import { Thumb } from "../shared/Thumb";
import { readabilityBand } from "../utils";

export function ContentPanel({ content }: { content: SeoContent }) {
  const missingAlt = content.images.filter((i) => !i.hasAlt);
  const band = readabilityBand(content.readabilityScore);

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 8 }} spacing="md">
        <Tile label="Words" value={num(content.wordCount)} icon={FileText} hint="300+ is a reasonable floor for a page meant to rank." />
        <Tile
          label="H1 headings"
          value={String(content.h1Count)}
          icon={Type}
          tone={content.h1Count === 1 ? "good" : "warn"}
          hint="Exactly one H1 per page."
        />
        <Tile
          label="H2 / H3"
          value={`${content.h2Count} / ${content.h3Count}`}
          icon={Type}
          hint="Subheadings that break the page into sections."
        />
        <Tile label="Images" value={String(content.imgCount)} icon={ImageIcon} />
        <Tile
          label="Links total"
          value={String(content.linkCount)}
          icon={Link2}
          hint="Every anchor on the page, internal and external."
        />
        <Tile label="Internal links" value={String(content.internalLinks)} icon={Link2} />
        <Tile label="External links" value={String(content.externalLinks)} icon={ExternalLink} />
        <Tile
          label={band.label}
          value={String(content.readabilityScore)}
          icon={Gauge}
          tone={content.readabilityScore >= 70 ? "good" : content.readabilityScore >= 50 ? "warn" : "bad"}
          hint="Flesch Reading Ease, 0-100. Higher is easier to read."
        />
      </SimpleGrid>

      <Panel
        title="Content quality"
        description="A composite of length, heading structure, alt text, links and structured data."
        icon={Gauge}
        semantic
        color={content.contentQuality >= 70 ? "teal" : content.contentQuality >= 40 ? "yellow" : "red"}
        right={
          <Badge
            size="lg"
            variant="light"
            color={content.contentQuality >= 70 ? "teal" : content.contentQuality >= 40 ? "yellow" : "red"}
          >
            {content.contentQuality} / 100
          </Badge>
        }
      >
        <Progress
          value={content.contentQuality}
          size="lg"
          radius="xl"
          color={content.contentQuality >= 70 ? "teal" : content.contentQuality >= 40 ? "yellow" : "red"}
          mb="md"
        />
        <Group justify="space-between" wrap="nowrap" gap="md">
          <Group gap={8}>
            <Text size="xs" c="dimmed">
              Structured data
            </Text>
            {content.hasSchema ? (
              <Badge size="xs" variant="light" color="teal">
                Present
              </Badge>
            ) : (
              <Badge size="xs" variant="light" color="yellow">
                None
              </Badge>
            )}
          </Group>
          {content.schemaTypes.length > 0 && (
            <Group gap={5} wrap="wrap" justify="flex-end">
              {content.schemaTypes.map((t) => (
                <Badge key={t} size="xs" variant="default">
                  {t}
                </Badge>
              ))}
            </Group>
          )}
        </Group>
      </Panel>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Panel
          title="Heading structure"
          description="How the page is outlined for crawlers."
          icon={Type}
          color="teal"
        >
          {content.headingStructure.length ? (
            <ScrollArea.Autosize mah={340}>
              <Stack gap="md">
                {content.headingStructure.map((h) => (
                  <Box key={h.level}>
                    <Group gap={8} mb={6}>
                      <Badge size="sm" variant="light" color="emerald">
                        H{h.level}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {h.count} on the page
                      </Text>
                    </Group>
                    <Stack gap={3} pl="md" style={{ borderLeft: "1px solid var(--mantine-color-default-border)" }}>
                      {h.texts.slice(0, 6).map((t, i) => (
                        <Text key={i} size="xs" c="dimmed" truncate>
                          {t}
                        </Text>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          ) : (
            <Empty>No headings found. Crawlers use headings to understand what a page covers.</Empty>
          )}
        </Panel>

        <Panel
          title="Top keywords"
          description="Share of body text, common words excluded."
          icon={Sparkles}
          color="grape"
        >
          {content.keywordDensity.length ? (
            <ScrollArea.Autosize mah={340}>
              <Stack gap={10}>
                {content.keywordDensity.map((k) => (
                  <Box key={k.word}>
                    <Group justify="space-between" gap="xs" mb={4}>
                      <Text size="xs" fw={500} truncate>
                        {k.word}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {k.count}× · {k.density}%
                      </Text>
                    </Group>
                    <Progress
                      value={Math.min(100, k.density * 12)}
                      size="sm"
                      radius="xl"
                      color="grape"
                    />
                  </Box>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          ) : (
            <Empty>Not enough text on this page to measure keyword density.</Empty>
          )}
        </Panel>
      </SimpleGrid>

      <Panel
        title="Images"
        description="Alt text is what search engines and screen readers read."
        icon={ImageIcon}
        color="grape"
        right={
          missingAlt.length > 0 ? (
            <Badge size="sm" variant="light" color="yellow">
              {missingAlt.length} missing alt
            </Badge>
          ) : content.images.length > 0 ? (
            <Badge size="sm" variant="light" color="teal">
              All labelled
            </Badge>
          ) : undefined
        }
      >
        {content.images.length ? (
          <ScrollArea.Autosize mah={360}>
            <Table striped highlightOnHover verticalSpacing="xs" fz="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={72}>Preview</Table.Th>
                  <Table.Th>Source</Table.Th>
                  <Table.Th w={220}>Alt text</Table.Th>
                  <Table.Th w={110}>Size</Table.Th>
                  <Table.Th w={80}>Loading</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {content.images.map((img, i) => (
                  <Table.Tr key={`${img.src}-${i}`}>
                    <Table.Td>
                      <Thumb src={img.src} alt={img.alt} />
                    </Table.Td>
                    <Table.Td style={{ maxWidth: 300 }}>
                      <Anchor
                        href={img.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        truncate
                        display="block"
                      >
                        {img.src}
                      </Anchor>
                    </Table.Td>
                    <Table.Td>
                      {img.hasAlt ? (
                        <Text size="xs" truncate>
                          {img.alt}
                        </Text>
                      ) : (
                        <Badge size="xs" color="yellow" variant="light">
                          Missing
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {img.width && img.height ? `${img.width}×${img.height}` : "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {img.loading || "eager"}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea.Autosize>
        ) : (
          <Empty>No images on this page.</Empty>
        )}
      </Panel>
    </Stack>
  );
}
