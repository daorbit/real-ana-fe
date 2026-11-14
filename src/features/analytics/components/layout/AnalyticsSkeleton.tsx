import { Group, SimpleGrid, Skeleton } from "@mantine/core";
import { ChartSkeleton, HeroListSkeleton, ListSkeleton, StatCardSkeleton } from "@/shared/ui/Skeletons";
import classes from "./AnalyticsLayout.module.css";

const TABBAR_WIDTH = 430;

function SectionTitleSkeleton({ width }: { width: number }) {
  return <Skeleton height={16} width={width} radius="sm" mb={14} />;
}

function HeaderSkeleton() {
  return (
    <header className={classes.header}>
      <div className={classes.headerText}>
        <Skeleton height={32} width={150} radius={8} mt={3} />
        <Skeleton height={14} width={380} maw="100%" mt={10} mb={4} radius="sm" />
      </div>
      <div className={classes.actions}>
        <Skeleton height={36} width={36} radius={10} />
        <Skeleton height={36} width={104} radius={10} />
        <Skeleton height={34} width={34} radius={10} />
        <Group gap="sm" wrap="nowrap" visibleFrom="sm">
          <Skeleton height={34} width={34} radius={10} />
          <Skeleton height={34} width={34} radius={10} />
        </Group>
      </div>
    </header>
  );
}

function DeckSkeleton() {
  return (
    <div className={classes.deck}>
      <div className={classes.filters}>
        <div className={classes.controls}>
          <Skeleton height={38} width={TABBAR_WIDTH} radius={11} />
          <div className={classes.range}>
            <Group gap="xs" wrap="nowrap">
              <Skeleton height={36} width={196} radius={10} />
              <Skeleton height={36} width={104} radius={10} />
            </Group>
          </div>
          <Group gap="xs" wrap="nowrap">
            <Skeleton height={36} width={112} radius={10} />
            <Skeleton height={36} width={150} radius={10} />
          </Group>
          <span className={classes.status}>
            <Skeleton height={10} width={130} radius="sm" />
          </span>
        </div>
      </div>
    </div>
  );
}

function StatBand({ titleWidth, live = false }: { titleWidth: number; live?: boolean }) {
  return (
    <>
      <SectionTitleSkeleton width={titleWidth} />
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing="md" className={classes.band}>
        {Array.from({ length: 4 }).map((_, i) => {
          const liveCard = live && i === 3;
          return <StatCardSkeleton key={i} spark={!liveCard} footer={liveCard} />;
        })}
      </SimpleGrid>
    </>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="an-report" aria-busy="true" aria-label="Loading analytics">
      <HeaderSkeleton />
      <DeckSkeleton />

      <StatBand titleWidth={78} live />
      <StatBand titleWidth={104} />

      <SectionTitleSkeleton width={64} />
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" className={classes.band}>
        <div className="grid-span-2">
          <ChartSkeleton height={242} />
        </div>
        <HeroListSkeleton rows={5} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <ListSkeleton rows={5} />
        <ListSkeleton rows={5} />
      </SimpleGrid>
    </div>
  );
}
