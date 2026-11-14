import { Grid, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { ChartSkeleton, ListSkeleton, StatCardSkeleton } from "@/shared/ui/Skeletons";
import classes from "./DashboardSkeleton.module.css";

const SMALL_CARDS = 4;
const HERO_TOTALS = 3;

function HeroSkeleton() {
  return (
    <div className={classes.hero}>
      <div>
        <Skeleton height={10} width={90} radius="sm" />
        <Skeleton height={48} width={120} mt={16} radius={10} />
      </div>
      <div className={classes.totals}>
        {Array.from({ length: HERO_TOTALS }, (_, i) => (
          <div key={i}>
            <Skeleton height={9} width={84} radius="sm" />
            <Skeleton height={22} width={64} mt={10} radius={6} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton({ hero = false }: { hero?: boolean }) {
  return (
    <Stack gap="lg" aria-busy="true" aria-label="Loading">
      {hero && <HeroSkeleton />}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: SMALL_CARDS }} spacing="lg">
        {Array.from({ length: SMALL_CARDS }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </SimpleGrid>
      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <ChartSkeleton height={240} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <ListSkeleton rows={5} aside={false} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
