import {
  Alert, Badge, Box, Card, Center, Group, Loader, Progress, ScrollArea, SimpleGrid,
  Stack, Table, Text, ThemeIcon,
} from "@mantine/core";
import { Info, Search, TrendingUp, Users, FileText, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SeoSearchTraffic } from "../../types";
import { num } from "../../utils";

/**
 * Organic search arrivals, from referrers already in the analytics database.
 *
 * The honesty note is not optional decoration. Google stopped passing search
 * terms in 2011, so this cannot show keywords, and a tool that implies it can
 * is one check away from losing the user's trust in everything else it says.
 */
export function SearchPanel({
  traffic,
  loading,
}: {
  traffic?: SeoSearchTraffic;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!traffic) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Text size="sm" c="dimmed">
            Search traffic is unavailable for this site.
          </Text>
        </Center>
      </Card>
    );
  }

  const share = traffic.totalVisits
    ? Math.round((traffic.visits / traffic.totalVisits) * 100)
    : 0;

  if (traffic.visits === 0) {
    return (
      <Stack gap="lg">
        <Card withBorder radius="md" padding="xl">
          <Center>
            <Stack align="center" gap="xs" maw={440}>
              <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                <Search size={24} />
              </ThemeIcon>
              <Text fw={650}>No organic search traffic yet</Text>
              <Text size="sm" c="dimmed" ta="center">
                Nobody has arrived from a search engine in the last {traffic.days} days. If
                the site is new, indexing usually takes a few weeks after a sitemap is
                submitted.
              </Text>
            </Stack>
          </Center>
        </Card>
        <NotProvidedNote />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <Tile label="Search visits" value={num(traffic.visits)} icon={Search} color="emerald" />
        <Tile label="From search" value={num(traffic.visitors)} icon={Users} color="cyan" />
        <Tile label="Organic share" value={`${share}%`} icon={TrendingUp} color="teal" />
        <Tile
          label="Engines"
          value={String(traffic.engines.length)}
          icon={Globe}
          color="grape"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Card withBorder radius="md" padding="lg">
          <Group gap="sm" mb="md">
            <ThemeIcon size={32} radius="md" variant="light" color="emerald">
              <Globe size={16} />
            </ThemeIcon>
            <div>
              <Text fw={650} size="sm">
                Search engines
              </Text>
              <Text size="xs" c="dimmed">
                Where organic visitors came from.
              </Text>
            </div>
          </Group>
          <Stack gap={10}>
            {traffic.engines.map((e) => (
              <Box key={e.engine}>
                <Group justify="space-between" gap="xs" mb={4}>
                  <Text size="sm" fw={500}>
                    {e.engine}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {num(e.visits)} visit{e.visits === 1 ? "" : "s"} · {num(e.visitors)}{" "}
                    visitor{e.visitors === 1 ? "" : "s"}
                  </Text>
                </Group>
                <Progress
                  value={(e.visits / traffic.visits) * 100}
                  size="sm"
                  radius="xl"
                  color="emerald"
                />
              </Box>
            ))}
          </Stack>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Group gap="sm" mb="md">
            <ThemeIcon size={32} radius="md" variant="light" color="cyan">
              <FileText size={16} />
            </ThemeIcon>
            <div>
              <Text fw={650} size="sm">
                Landing pages
              </Text>
              <Text size="xs" c="dimmed">
                The pages search sends people to.
              </Text>
            </div>
          </Group>
          {traffic.landingPages.length ? (
            <ScrollArea.Autosize mah={320}>
              <Table verticalSpacing="xs" fz="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Path</Table.Th>
                    <Table.Th w={70}>Visits</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {traffic.landingPages.map((p) => (
                    <Table.Tr key={p.path}>
                      <Table.Td style={{ maxWidth: 260 }}>
                        <Text size="xs" truncate>
                          {p.path}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light" color="cyan">
                          {num(p.visits)}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea.Autosize>
          ) : (
            <Text size="sm" c="dimmed">
              No landing pages recorded.
            </Text>
          )}
        </Card>
      </SimpleGrid>

      {traffic.hasTerms && (
        <Card withBorder radius="md" padding="lg">
          <Group gap="sm" mb="md">
            <ThemeIcon size={32} radius="md" variant="light" color="yellow">
              <Search size={16} />
            </ThemeIcon>
            <div>
              <Text fw={650} size="sm">
                Search terms
              </Text>
              <Text size="xs" c="dimmed">
                The few engines that still pass a query term. Not representative of total
                search traffic.
              </Text>
            </div>
          </Group>
          <Stack gap={6}>
            {traffic.terms.map((t) => (
              <Group key={t.term} justify="space-between" gap="xs">
                <Text size="sm" truncate>
                  {t.term}
                </Text>
                <Badge size="sm" variant="light" color="yellow">
                  {num(t.visits)}
                </Badge>
              </Group>
            ))}
          </Stack>
        </Card>
      )}

      <NotProvidedNote />
    </Stack>
  );
}

/**
 * States the limitation up front rather than letting the user discover it by
 * wondering where the keywords are.
 */
function NotProvidedNote() {
  return (
    <Alert color="gray" variant="light" radius="md" icon={<Info size={16} />}>
      <Text size="sm" fw={600} mb={4}>
        Why there are no keywords here
      </Text>
      <Text size="sm">
        Google has withheld search terms from referrers since 2011, and the other major
        engines followed. No tool can recover keyword data from analytics referrers — what
        you get instead is which engines send traffic and which pages they land on. For
        actual queries, impressions and average position, connect Google Search Console.
      </Text>
    </Alert>
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
