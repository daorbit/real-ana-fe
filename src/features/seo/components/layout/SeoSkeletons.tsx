import { Skeleton } from "@mantine/core";
import { ChartSkeleton, ListSkeleton, StatCardSkeleton } from "@/shared/ui/Skeletons";
import type { SeoTabId } from "../sections";
import classes from "./SeoSkeletons.module.css";

function Tiles({ count }: { count: number }) {
  return (
    <div className={classes.tiles}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} spark={false} />
      ))}
    </div>
  );
}

function Jumps({ count }: { count: number }) {
  return (
    <div className={classes.jumps}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={28} width={84 + (i % 3) * 18} radius={10} />
      ))}
    </div>
  );
}

function BlockSkeleton({ rows }: { rows: number }) {
  return (
    <div className={classes.block}>
      <Skeleton height={18} width={150} radius="sm" />
      <Skeleton height={10} width="46%" radius="sm" mt={8} mb={14} />
      <ListSkeleton rows={rows} aside={false} />
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className={classes.stack}>
      <div className={classes.split}>
        <Skeleton height={210} radius={16} />
        <Skeleton height={210} radius={16} />
      </div>
      <Tiles count={4} />
      <div className={classes.split}>
        <ChartSkeleton height={150} />
        <ListSkeleton rows={4} aside={false} />
      </div>
      <ListSkeleton rows={5} />
    </div>
  );
}

function IssuesSkeleton() {
  return (
    <div className={classes.stack}>
      <div className={classes.toolbar}>
        <Skeleton height={34} width={330} radius={10} />
        <span className={classes.spacer} />
        <Skeleton height={34} width={220} radius={10} />
        <Skeleton height={30} width={86} radius={10} />
      </div>
      <ListSkeleton rows={8} />
    </div>
  );
}

function PerformanceSkeleton() {
  return (
    <div className={classes.stack}>
      <Tiles count={4} />
      <ChartSkeleton height={180} />
      <ListSkeleton rows={6} />
    </div>
  );
}

function GroupedSkeleton() {
  return (
    <div className={classes.stack}>
      <Jumps count={4} />
      <BlockSkeleton rows={4} />
      <BlockSkeleton rows={3} />
      <BlockSkeleton rows={3} />
    </div>
  );
}

export function SeoTabSkeleton({ tab }: { tab: SeoTabId }) {
  const body =
    tab === "issues" ? <IssuesSkeleton />
    : tab === "performance" ? <PerformanceSkeleton />
    : tab === "onpage" || tab === "site" ? <GroupedSkeleton />
    : <OverviewSkeleton />;
  return (
    <div aria-busy="true" aria-label="Loading SEO report">
      {body}
    </div>
  );
}

export function SeoInspectSkeleton() {
  return <Skeleton height={98} radius={16} className={classes.inspect} />;
}
