import { useState } from "react";
import {
  Alert, Anchor, Badge, Box, Button, Card, Center, Group, ScrollArea, SimpleGrid,
  Stack, Table, Text, ThemeIcon, Tooltip,
} from "@mantine/core";
import {
  AlertTriangle, CheckCircle2, Clock, Link2, Link2Off, ServerCrash, ShieldAlert,
  CornerDownRight, Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SeoLinkCheck, SeoLinkResult, SeoLinkStatus } from "../../types";

const STATUS: Record<
  SeoLinkStatus,
  { label: string; color: string; icon: LucideIcon; explain: string }
> = {
  ok: { label: "OK", color: "teal", icon: CheckCircle2, explain: "Responded normally." },
  broken: {
    label: "Broken",
    color: "red",
    icon: Link2Off,
    explain: "The target does not exist. Visitors following this link hit a dead end.",
  },
  "server-error": {
    label: "Server error",
    color: "orange",
    icon: ServerCrash,
    explain: "The target server failed. This may be temporary — worth re-checking later.",
  },
  redirect: {
    label: "Redirect",
    color: "yellow",
    icon: CornerDownRight,
    explain: "Resolves, but only after a detour. Each hop costs crawl budget.",
  },
  timeout: {
    label: "Timeout",
    color: "orange",
    icon: Clock,
    explain: "No response in time. The target may be slow rather than broken.",
  },
  blocked: {
    label: "Blocked",
    color: "gray",
    icon: ShieldAlert,
    explain: "Not checked — the address is not publicly reachable.",
  },
  skipped: {
    label: "Skipped",
    color: "gray",
    icon: Info,
    explain: "Over the per-audit link limit.",
  },
};

type Filter = "problems" | "all" | SeoLinkStatus;

/**
 * Link check results.
 *
 * Defaults to problems only: a page with 90 healthy links and 3 dead ones
 * should open on the 3. The full list is one click away.
 */
export function LinksPanel({ links }: { links?: SeoLinkCheck }) {
  const [filter, setFilter] = useState<Filter>("problems");

  if (!links) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Stack align="center" gap="xs" maw={400}>
            <ThemeIcon size={48} radius="xl" variant="light" color="gray">
              <Link2 size={24} />
            </ThemeIcon>
            <Text fw={650}>Not checked on this report</Text>
            <Text size="sm" c="dimmed" ta="center">
              This audit ran before link checking was added. Re-run it to test every link
              on the page.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  const problems = links.results.filter(
    (r) => r.status !== "ok" && r.status !== "skipped" && r.status !== "blocked"
  );

  const shown =
    filter === "all"
      ? links.results
      : filter === "problems"
      ? problems
      : links.results.filter((r) => r.status === filter);

  const healthy = links.results.filter((r) => r.status === "ok").length;

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <Tile
          label="Working"
          value={healthy}
          icon={CheckCircle2}
          color="teal"
          onClick={() => setFilter("ok")}
        />
        <Tile
          label="Broken"
          value={links.broken}
          icon={Link2Off}
          color={links.broken ? "red" : "gray"}
          onClick={() => setFilter("broken")}
        />
        <Tile
          label="Redirects"
          value={links.redirects}
          icon={CornerDownRight}
          color={links.redirects ? "yellow" : "gray"}
          onClick={() => setFilter("redirect")}
        />
        <Tile
          label="Errors / timeouts"
          value={links.serverErrors + links.timeouts}
          icon={ServerCrash}
          color={links.serverErrors + links.timeouts ? "orange" : "gray"}
          onClick={() => setFilter("server-error")}
        />
      </SimpleGrid>

      {links.results.some((r) => r.status === "broken" && r.internal) && (
        <Alert color="red" variant="light" radius="md" icon={<AlertTriangle size={16} />}>
          Some broken links point at your own site. Those are entirely within your control
          and should be fixed first.
        </Alert>
      )}

      {links.skipped > 0 && (
        <Alert color="gray" variant="light" radius="md" icon={<Info size={15} />}>
          {links.skipped} link{links.skipped === 1 ? " was" : "s were"} not checked — one
          audit tests at most 100, internal links first.
        </Alert>
      )}

      <Card withBorder radius="md" padding={0}>
        <Group gap={6} p="md" wrap="wrap">
          <FilterChip active={filter === "problems"} onClick={() => setFilter("problems")}>
            Problems ({problems.length})
          </FilterChip>
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All ({links.results.length})
          </FilterChip>
        </Group>

        {shown.length ? (
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="xs" fz="xs" miw={640}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={120}>Status</Table.Th>
                  <Table.Th>Link</Table.Th>
                  <Table.Th w={180}>Anchor text</Table.Th>
                  <Table.Th w={80}>Scope</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {shown.map((r, i) => (
                  <LinkRow key={`${r.url}-${i}`} result={r} />
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        ) : (
          <Center py="xl">
            <Stack align="center" gap={6}>
              <ThemeIcon size={40} radius="xl" variant="light" color="teal">
                <CheckCircle2 size={20} />
              </ThemeIcon>
              <Text size="sm" fw={600}>
                {filter === "problems" ? "Every link works" : "Nothing in this view"}
              </Text>
              <Text size="xs" c="dimmed">
                {links.checked} link{links.checked === 1 ? "" : "s"} checked.
              </Text>
            </Stack>
          </Center>
        )}
      </Card>
    </Stack>
  );
}

function LinkRow({ result }: { result: SeoLinkResult }) {
  const s = STATUS[result.status];
  const Icon = s.icon;

  return (
    <Table.Tr>
      <Table.Td>
        <Tooltip label={result.note ?? s.explain} withArrow multiline w={260}>
          <Badge
            size="sm"
            variant="light"
            color={s.color}
            leftSection={<Icon size={10} />}
            style={{ cursor: "help" }}
          >
            {result.statusCode ?? s.label}
          </Badge>
        </Tooltip>
      </Table.Td>
      <Table.Td style={{ maxWidth: 340 }}>
        <Anchor
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
          truncate
          display="block"
        >
          {result.url}
        </Anchor>
        {result.chain.length > 1 && (
          <Text size="xs" c="dimmed" truncate>
            → {result.chain[result.chain.length - 1]}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed" truncate>
          {result.text || "—"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge size="xs" variant="default">
          {result.internal ? "Internal" : "External"}
        </Badge>
      </Table.Td>
    </Table.Tr>
  );
}

function Tile({
  label,
  value,
  icon: Icon,
  color,
  onClick,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}) {
  return (
    <Box className="seo-tile" p="md" onClick={onClick} style={{ cursor: "pointer" }}>
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      size="xs"
      radius="md"
      variant={active ? "filled" : "light"}
      color={active ? "emerald" : "gray"}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
