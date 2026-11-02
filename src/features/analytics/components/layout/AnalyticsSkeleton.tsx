import { Group, SimpleGrid, Skeleton } from "@mantine/core";
import { ChartSkeleton, ListSkeleton, StatCardSkeleton } from "@/shared/ui/Skeletons";
import classes from "./AnalyticsLayout.module.css";

const SECTION_WIDTHS = [72, 70, 86, 82];
const RANGE_COUNT = 4;

function StatBand({ titleWidth, liveLast = false }: { titleWidth: number; liveLast?: boolean }) {
  return (
    <>
      <Skeleton height={14} width={titleWidth} radius="sm" mb={14} />
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing="md" className={classes.band}>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} spark={!(liveLast && i === 3)} />
        ))}
      </SimpleGrid>
    </>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="an-report" aria-busy="true" aria-label="Loading analytics">
      <header className={classes.header}>
        <div className={classes.headerText}>
          <Skeleton height={30} width={150} radius={8} />
          <Skeleton height={12} width={360} mt={12} radius="sm" />
        </div>
        <Group gap={8} wrap="nowrap">
          <Skeleton height={10} width={92} radius="sm" />
          <Skeleton height={34} width={34} radius={10} />
          <Skeleton height={34} width={86} radius={10} />
          <Skeleton height={34} width={78} radius={10} />
        </Group>
      </header>

      <div className={classes.deck}>
        <div className={classes.filters}>
          <div className={classes.controls}>
            <Skeleton height={36} width={112} radius={10} />
            <Group gap={10} wrap="nowrap">
              <Skeleton height={36} width={RANGE_COUNT * 46 + 8} radius={12} />
              <Skeleton height={36} width={96} radius={10} />
              <Skeleton height={36} width={110} radius={12} />
              <Skeleton height={36} width={140} radius={10} />
            </Group>
          </div>
          <Group gap={8} wrap="nowrap">
            <Skeleton height={10} width={60} radius="sm" />
            <Skeleton height={26} width={100} radius={8} />
            <Skeleton height={26} width={84} radius={8} />
            <Skeleton height={26} width={118} radius={8} />
          </Group>
        </div>

        <div className={classes.bar}>
          <Group gap={4} wrap="nowrap" className={classes.tabbar}>
            {SECTION_WIDTHS.map((w, i) => (
              <Skeleton key={i} height={32} width={w + 24} radius={8} />
            ))}
          </Group>
          <Skeleton height={10} width={130} radius="sm" />
        </div>
      </div>

      <StatBand titleWidth={74} liveLast />
      <StatBand titleWidth={96} />

      <Skeleton height={14} width={60} radius="sm" mb={14} />
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" className={classes.band}>
        <div className="grid-span-2">
          <ChartSkeleton height={260} />
        </div>
        <ListSkeleton rows={5} aside={false} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <ListSkeleton rows={5} />
        <ListSkeleton rows={5} />
      </SimpleGrid>
    </div>
  );
}
