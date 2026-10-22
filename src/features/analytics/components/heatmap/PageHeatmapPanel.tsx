import { useState } from "react";
import { SimpleGrid } from "@mantine/core";
import { skipToken } from "@reduxjs/toolkit/query";
import { Flame, Inbox, MousePointerClick } from "lucide-react";
import { useGetHeatmapPagesQuery, useGetPageHeatmapQuery } from "@/app/store";
import { num } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { RankList } from "@/shared/ui/rank/RankList";
import { PathLabel } from "@/shared/ui/rank/PathLabel";
import { ChartSkeleton } from "@/shared/ui/Skeletons";
import { HeatmapDeviceSwitch } from "@/features/analytics/components/heatmap/HeatmapDeviceSwitch";
import { HeatmapFrame } from "@/features/analytics/components/heatmap/HeatmapFrame";
import { HeatmapSummary } from "@/features/analytics/components/heatmap/HeatmapSummary";
import { HeatmapSetup } from "@/features/analytics/components/heatmap/HeatmapSetup";
import type { HeatmapDevice, HeatmapPage } from "@/shared/types";
import classes from "@/features/analytics/components/heatmap/PageHeatmap.module.css";

const EMPTY_PAGES: HeatmapPage[] = [];

export function PageHeatmapPanel({
  workspaceId,
  range,
  from,
  to,
  sites,
}: {
  workspaceId: string;
  range: string;
  from?: string;
  to?: string;
  sites?: string[];
}) {
  const [device, setDevice] = useState<HeatmapDevice>("desktop");
  const [picked, setPicked] = useState<string | null>(null);

  const scope = { workspaceId, range, device, sites, from, to };
  const { currentData: pagesData, isFetching: pagesLoading, isError: pagesFailed } = useGetHeatmapPagesQuery(scope);
  const pages = pagesData?.pages ?? EMPTY_PAGES;
  const path = picked && pages.some((p) => p.path === picked) ? picked : pages[0]?.path ?? null;

  const { currentData: heatmap, isFetching: heatmapLoading } = useGetPageHeatmapQuery(
    path ? { ...scope, path } : skipToken,
  );

  if (pagesData && !pagesData.enabled && pages.length === 0) return <HeatmapSetup enabled={false} />;

  return (
    <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
      <RankCard
        title="Pages"
        icon={Flame}
        tone="orange"
        subtitle={pages.length ? `${pages.length} with heatmap data` : undefined}
        actions={<HeatmapDeviceSwitch value={device} onChange={setDevice} />}
      >
        {pagesLoading && !pagesData ? (
          <ChartSkeleton height={240} />
        ) : pagesFailed ? (
          <RankEmpty icon={Inbox}>Heatmaps couldn&apos;t load. Refresh to try again.</RankEmpty>
        ) : pages.length === 0 ? (
          <RankEmpty icon={Inbox}>
            No {device} clicks in this range yet. Check that the snippet on your site includes
            data-heatmap=&quot;on&quot;, or try another device.
          </RankEmpty>
        ) : (
          <RankList
            limit={12}
            selectedId={path}
            selectHint="View"
            hintIcon={MousePointerClick}
            onSelect={setPicked}
            items={pages.map((p) => ({
              id: p.path,
              label: <PathLabel path={p.path} />,
              title: p.path,
              weight: p.clicks,
              value: num(p.clicks),
              aside: `${num(p.sessions)} visits`,
            }))}
          />
        )}
      </RankCard>

      <div className="grid-span-2">
        <RankCard
          title={path ?? "Page heatmap"}
          icon={MousePointerClick}
          tone="orange"
          subtitle="Where visitors click, and how far they scroll"
        >
          {!path ? (
            <RankEmpty icon={Inbox}>Pick a page to see its heatmap.</RankEmpty>
          ) : heatmapLoading || !heatmap ? (
            <ChartSkeleton height={420} />
          ) : (
            <>
              <HeatmapSummary heatmap={heatmap} />
              <HeatmapFrame heatmap={heatmap} />
              <p className={classes.note}>
                Positions are shown on a scaled outline of the page. Shaded bands are where most visitors have already left.
              </p>
            </>
          )}
        </RankCard>
      </div>
    </SimpleGrid>
  );
}
