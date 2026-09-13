import { Anchor, Badge, ScrollArea, SimpleGrid, Stack, Table, Text } from "@mantine/core";
import { Image as ImageIcon } from "lucide-react";
import type { SeoContent } from "@/shared/types";
import { Panel, Empty } from "@/features/seo/components/shared/Panel";
import { Tile } from "@/features/seo/components/shared/Tile";
import { Thumb } from "@/features/seo/components/shared/Thumb";

/**
 * Every image on the page with its alt text, split out of Content.
 *
 * On an image-heavy page this table was most of the Content tab's height, which
 * buried the headings and keyword sections above it. It also stands on its own:
 * fixing alt text is a different job, often for a different person, than
 * rewriting copy.
 */
export function ImagesPanel({ content }: { content: SeoContent }) {
  const missingAlt = content.images.filter((i) => !i.hasAlt);
  const lazy = content.images.filter((i) => i.loading === "lazy");
  const noDimensions = content.images.filter((i) => !i.width || !i.height);

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <Tile label="Images" value={String(content.images.length)} icon={ImageIcon} color="grape" />
        <Tile
          label="Missing alt"
          value={String(missingAlt.length)}
          icon={ImageIcon}
          color={missingAlt.length ? "yellow" : "teal"}
        />
        <Tile label="Lazy loaded" value={String(lazy.length)} icon={ImageIcon} color="cyan" />
        {/* Images without width and height are the usual cause of layout shift,
            so they are worth counting even when every alt is present. */}
        <Tile
          label="No dimensions"
          value={String(noDimensions.length)}
          icon={ImageIcon}
          color={noDimensions.length ? "yellow" : "teal"}
        />
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
          <ScrollArea.Autosize mah={520}>
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
