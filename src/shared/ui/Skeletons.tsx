import { Box, Card, Group, Skeleton, SimpleGrid, Stack } from "@mantine/core";
import { SwitchVisual } from "@/shared/ui/SwitchOverlay";

/** A stat card placeholder — icon, big number, label. */
export function StatCardSkeleton() {
  return (
    <Card withBorder radius="lg" padding="lg">
      <Group justify="space-between" align="flex-start">
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={20} width={54} radius="xl" />
      </Group>
      <Skeleton height={30} width="55%" mt="md" radius="sm" />
      <Skeleton height={12} width="40%" mt={10} radius="sm" />
    </Card>
  );
}

/** A ranked-list panel placeholder. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Skeleton height={12} width={110} mb="lg" radius="sm" />
      <Stack gap="md">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i}>
            <Group justify="space-between" mb={6}>
              <Skeleton height={10} width={`${70 - i * 8}%`} radius="sm" />
              <Skeleton height={10} width={28} radius="sm" />
            </Group>
            <Skeleton height={6} radius="xl" />
          </div>
        ))}
      </Stack>
    </Card>
  );
}

/** A chart panel placeholder. */
export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="lg">
        <Skeleton height={12} width={130} radius="sm" />
        <Skeleton height={22} width={70} radius="sm" />
      </Group>
      <Skeleton height={height} radius="md" />
    </Card>
  );
}

/** The Home page while its data loads. */
export function HomeSkeleton() {
  return (
    <>
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Skeleton height={28} width={240} radius="sm" />
          <Skeleton height={12} width={300} mt={10} radius="sm" />
        </div>
        <Group gap="sm">
          <Skeleton height={36} width={110} radius="md" />
          <Skeleton height={36} width={120} radius="md" />
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} mb="lg">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" mb="lg">
        <div className="grid-span-2"><ChartSkeleton /></div>
        <ListSkeleton rows={4} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <ListSkeleton />
        <ListSkeleton />
      </SimpleGrid>
    </>
  );
}

/** The Analytics page while its data loads. */
export function AnalyticsSkeleton() {
  return (
    <>
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Skeleton height={28} width={160} radius="sm" />
          <Skeleton height={12} width={320} mt={10} radius="sm" />
        </div>
        <Group gap="sm">
          <Skeleton height={36} width={110} radius="md" />
          <Skeleton height={32} width={180} radius="md" />
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} mb="md">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </SimpleGrid>
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} mb="lg">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" mb="lg">
        <div className="grid-span-2"><ChartSkeleton height={260} /></div>
        <ListSkeleton rows={4} />
      </SimpleGrid>

      <Skeleton height={34} width={340} radius="md" mb="lg" />

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
        <ListSkeleton /><ListSkeleton /><ListSkeleton />
      </SimpleGrid>
    </>
  );
}

/** The Workspaces page while its data loads. */
export function WorkspacesSkeleton() {
  return (
    <>
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Skeleton height={28} width={180} radius="sm" />
          <Skeleton height={12} width={280} mt={10} radius="sm" />
        </div>
        <Skeleton height={36} width={160} radius="md" />
      </Group>

      <Card withBorder radius="lg" padding="xl" mb="xl">
        <Skeleton height={20} width={200} radius="sm" />
        <Skeleton height={11} width={280} mt={10} radius="sm" />
        <Skeleton height={1} mt="xl" mb="lg" />
        <Skeleton height={12} width={140} mb="md" radius="sm" />
        <Stack gap="sm">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} withBorder radius="md" padding="md">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="md" wrap="nowrap" style={{ flex: 1 }}>
                  <Skeleton height={38} width={38} radius="md" />
                  <div style={{ flex: 1 }}>
                    <Skeleton height={12} width="35%" radius="sm" />
                    <Skeleton height={10} width="55%" mt={8} radius="sm" />
                  </div>
                </Group>
                <Group gap={6}>
                  <Skeleton height={28} width={72} radius="md" />
                  <Skeleton height={28} width={78} radius="md" />
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      </Card>

      <Skeleton height={12} width={140} mb="md" radius="sm" />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} withBorder radius="lg" padding="lg">
            <Skeleton height={14} width="50%" radius="sm" />
            <Skeleton height={10} width="80%" mt={10} radius="sm" />
            <Skeleton height={34} mt="md" radius="md" />
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}

/**
 * The Members page while its list loads.
 *
 * Mirrors the real layout — two summary cards, then a row per person — so the
 * page doesn't reflow when the data lands. Three rows because that is a
 * plausible team; more would promise a crowd that usually isn't there.
 */
export function MembersSkeleton() {
  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} withBorder radius="md" padding="md">
            <Group gap="sm" wrap="nowrap">
              <Skeleton height={38} width={38} radius="md" />
              <div style={{ flex: 1 }}>
                <Skeleton height={18} width="35%" radius="sm" />
                <Skeleton height={10} width="70%" mt={8} radius="sm" />
              </div>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <div>
        <Skeleton height={12} width={60} mb="sm" radius="sm" />
        <Stack gap="xs">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} withBorder radius="md" padding="sm">
              <Group justify="space-between" wrap="nowrap" gap="sm">
                <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                  <Skeleton height={40} width={40} radius="xl" />
                  <div style={{ flex: 1 }}>
                    <Skeleton height={12} width={`${45 - i * 6}%`} radius="sm" />
                    <Skeleton height={10} width={`${65 - i * 6}%`} mt={8} radius="sm" />
                  </div>
                </Group>
                <Skeleton height={22} width={74} radius="xl" />
              </Group>
            </Card>
          ))}
        </Stack>
      </div>
    </Stack>
  );
}

/**
 * The Scheduled posts page while its list loads.
 *
 * Built from the timeline's own classes rather than from plain stacked cards,
 * because the thing that makes this page recognisable is its shape: a fixed
 * gutter of times down the left, a centred column of cards beside it, capped
 * well short of the window. A full-width skeleton is not a quieter version of
 * that layout — it is a different one, and the page visibly rearranges itself
 * the moment real rows arrive.
 *
 * The page header is not drawn here. It renders above this, already real, and
 * a second ghost of it underneath reads as two headers.
 */
export function SocialPostsSkeleton() {
  return (
    <Stack className="post-timeline" gap={34}>
      {Array.from({ length: 2 }).map((_, day) => (
        <div key={day}>
          {/* The day heading sits over the card column, not over the gutter,
              so it lines up with the real headings it replaces. */}
          <Skeleton
            height={13}
            width={110}
            mb="md"
            radius="sm"
            ml="var(--post-gutter, 92px)"
          />
          <Stack gap={10}>
            {Array.from({ length: day === 0 ? 2 : 1 }).map((_, i) => (
              <Group key={i} className="post-slot" align="flex-start" wrap="nowrap" gap={0}>
                {/* The gutter, kept even though it holds only a ghost of the
                    clock: it is what sets the card column's left edge. */}
                <Box className="post-slot__time">
                  <Skeleton height={13} width={58} radius="sm" ml="auto" />
                  <Skeleton height={10} width={42} radius="sm" ml="auto" mt={6} />
                </Box>

                <Box className="post-slot__card">
                  <Group gap={8} wrap="nowrap" align="center" p="md" pb={8}>
                    <Skeleton height={28} width={28} radius="xl" />
                    <Skeleton height={12} width={120} radius="sm" />
                  </Group>
                  <Box px="md" pb={12}>
                    <Skeleton height={12} width="45%" mb={8} radius="sm" />
                    <Skeleton height={10} width="90%" radius="sm" />
                  </Box>
                  {/* The foot: the row of actions every real card carries, so
                      the card keeps its full height and nothing below it
                      shifts when the list lands. */}
                  <Group className="post-slot__foot" justify="space-between" wrap="nowrap" gap="sm">
                    <Skeleton height={10} width={140} radius="sm" />
                    <Group gap={6} wrap="nowrap">
                      <Skeleton height={26} width={104} radius="sm" />
                      <Skeleton height={26} width={26} radius="sm" />
                      <Skeleton height={26} width={26} radius="sm" />
                    </Group>
                  </Group>
                </Box>
              </Group>
            ))}
          </Stack>
        </div>
      ))}
    </Stack>
  );
}

/** Full-screen boot animation — used while the session is being restored. */
export function AppBootSkeleton() {
  return <SwitchVisual sublabel="Restoring your session" loop />;
}
