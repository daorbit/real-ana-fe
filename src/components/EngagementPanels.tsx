import { Card, Group, Text, Stack, Center, ThemeIcon, Progress } from "@mantine/core";
import { Inbox, ArrowDownWideNarrow, LogIn } from "lucide-react";
import { num, share } from "../utils";
import type { ScrollBucket, LandingBucket } from "../types";

function Shell({
  title,
  icon: Icon,
  empty,
  children,
  hint,
}: {
  title: string;
  icon: React.ElementType;
  empty: boolean;
  children: React.ReactNode;
  /** Shown in place of the rows when there is nothing to show. */
  hint: React.ReactNode;
}) {
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group gap={8} mb="md">
        <Icon size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">{title}</Text>
      </Group>

      {empty ? (
        <Center py="lg">
          <Stack align="center" gap="xs" maw={380}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md">
              <Inbox size={16} />
            </ThemeIcon>
            {hint}
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">{children}</Stack>
      )}
    </Card>
  );
}

/** How far down each page people actually get before leaving. */
export function ScrollPanel({
  items,
  outdated = false,
}: {
  items: ScrollBucket[];
  /** The site is on a tracker too old to measure scroll position. */
  outdated?: boolean;
}) {
  return (
    <Shell
      title="Scroll depth"
      icon={ArrowDownWideNarrow}
      empty={items.length === 0}
      hint={
        <Text c="dimmed" size="xs" ta="center">
          {outdated
            ? "Your tracking script is too old to measure scroll depth. Update it using the banner at the top of this page — no markup needed, it works as soon as the new script loads."
            : "Waiting for the first visitors to scroll a page."}
        </Text>
      }
    >
      {items.map((i) => (
        <div key={i.key}>
          <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
            <Text size="sm" truncate style={{ flex: 1 }}>{i.key}</Text>
            <Group gap={6} wrap="nowrap">
              <Text size="xs" c="dimmed">{i.completionRate}% reach the end</Text>
              <Text size="sm" fw={700}>{i.avgDepth}%</Text>
            </Group>
          </Group>
          <Progress
            value={i.avgDepth}
            size="sm"
            radius="xl"
            // Half the page unread is the point where it's worth looking at.
            color={i.avgDepth >= 70 ? "emerald" : i.avgDepth >= 40 ? "amber" : "pink"}
          />
        </div>
      ))}
    </Shell>
  );
}

/** Which entry points actually hold people, rather than merely attract them. */
export function LandingPanel({ items }: { items: LandingBucket[] }) {
  const total = items.reduce((sum, i) => sum + i.count, 0);
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <Shell
      title="Landing pages"
      icon={LogIn}
      empty={items.length === 0}
      hint={<Text c="dimmed" size="xs" ta="center">Waiting for data…</Text>}
    >
      {items.map((i) => (
        <div key={i.key}>
          <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
            <Text size="sm" truncate style={{ flex: 1 }}>{i.key}</Text>
            <Group gap={6} wrap="nowrap">
              <Text size="xs" c="dimmed">{share(i.count, total)}</Text>
              <Text size="sm" fw={700}>{num(i.count)}</Text>
            </Group>
          </Group>
          <Progress value={(i.count / max) * 100} size="sm" radius="xl" color="emerald" />
          <Group gap="md" mt={3}>
            <Text size="xs" c={i.bounceRate >= 70 ? "pink" : "dimmed"}>
              {i.bounceRate}% bounce
            </Text>
            <Text size="xs" c="dimmed">{i.pagesPerSession} pages / session</Text>
          </Group>
        </div>
      ))}
    </Shell>
  );
}
