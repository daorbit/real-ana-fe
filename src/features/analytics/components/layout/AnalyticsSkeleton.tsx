import { SimpleGrid, Skeleton } from "@mantine/core";
import { ChartSkeleton, HeroListSkeleton, ListSkeleton, StatCardSkeleton } from "@/shared/ui/Skeletons";
import classes from "./AnalyticsLayout.module.css";

function SectionTitleSkeleton({ width }: { width: number }) {
  return <Skeleton height={16} width={width} radius="sm" mb={14} />;
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

export function AnalyticsPanelSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" aria-busy="true" aria-label="Loading analytics">
      <ListSkeleton rows={6} />
      <ListSkeleton rows={6} />
    </SimpleGrid>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading analytics">
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
