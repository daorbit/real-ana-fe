import { Grid, SimpleGrid, Skeleton, Stack } from "@mantine/core";

const SMALL_CARDS = 4;

export function DashboardSkeleton({ hero = false }: { hero?: boolean }) {
  return (
    <Stack gap="lg">
      {hero && <Skeleton height={150} radius="lg" />}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: SMALL_CARDS }} spacing="lg">
        {Array.from({ length: SMALL_CARDS }, (_, i) => (
          <Skeleton key={i} height={160} radius="lg" />
        ))}
      </SimpleGrid>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Skeleton height={320} radius="lg" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Skeleton height={320} radius="lg" />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
