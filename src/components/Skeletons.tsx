import { Card, Group, Skeleton, SimpleGrid, Stack, Center, Loader } from "@mantine/core";

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

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" mb="lg">
        <div style={{ gridColumn: "span 2" }}><ChartSkeleton /></div>
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

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="md">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" mb="lg">
        <div style={{ gridColumn: "span 2" }}><ChartSkeleton height={260} /></div>
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

/** Full-screen spinner — used while the session is being restored. */
export function AppBootSkeleton() {
  return (
    <Center mih="100vh">
      <Loader color="emerald" size="md" />
    </Center>
  );
}
