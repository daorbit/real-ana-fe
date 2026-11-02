import { useState } from "react";
import { Select, SegmentedControl } from "@mantine/core";
import { skipToken } from "@reduxjs/toolkit/query";
import { Inbox } from "lucide-react";
import { useGetHeatmapPagesQuery, useGetPageHeatmapQuery } from "@/app/store";
import { num } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { RankList } from "@/shared/ui/rank/RankList";
import { ChartSkeleton } from "@/shared/ui/Skeletons";
import { HeatmapDeviceSwitch } from "@/features/analytics/components/heatmap/HeatmapDeviceSwitch";
import { HeatmapFrame } from "@/features/analytics/components/heatmap/HeatmapFrame";
import { HeatmapSummary } from "@/features/analytics/components/heatmap/HeatmapSummary";
import { HeatmapSetup } from "@/features/analytics/components/heatmap/HeatmapSetup";
import { halfwayDepth } from "@/features/analytics/lib/heatmapDraw";
import type { ClickBucket, HeatmapDevice, HeatmapPage } from "@/shared/types";
import classes from "@/features/analytics/components/heatmap/PageHeatmap.module.css";

const EMPTY_PAGES: HeatmapPage[] = [];
const EMPTY_CLICKS: ClickBucket[] = [];
const QUICK_PAGES = 4;

export function PageHeatmapPanel({
  workspaceId,
  range,
  from,
  to,
  sites,
  clicks = EMPTY_CLICKS,
  host,
}: {
  workspaceId: string;
  range: string;
  from?: string;
  to?: string;
  sites?: string[];
  clicks?: ClickBucket[];
  host?: string;
}) {
  const [device, setDevice] = useState<HeatmapDevice>("desktop");
  const [picked, setPicked] = useState<string | null>(null);

  const scope = { workspaceId, range, device, sites, from, to };
  const { currentData: pagesData, isFetching: pagesLoading, isError: pagesFailed } = useGetHeatmapPagesQuery(scope);
  const pages = pagesData?.pages ?? EMPTY_PAGES;
  const path = picked && pages.some((p) => p.path === picked) ? picked : pages[0]?.path ?? null;
  const current = pages.find((p) => p.path === path);

  const { currentData: heatmap, isFetching: heatmapLoading } = useGetPageHeatmapQuery(
    path ? { ...scope, path } : skipToken,
  );

  if (pagesData && !pagesData.enabled && pages.length === 0) return <HeatmapSetup enabled={false} />;

  const quick = pages.slice(0, QUICK_PAGES).map((p) => p.path);
  const rest = pages.slice(QUICK_PAGES).map((p) => p.path);
  const onPage = clicks.filter((c) => c.path === path);
  const halfway = heatmap && heatmap.scroll.sessions > 0 ? halfwayDepth(heatmap.scroll.reach) : null;

  return (
    <RankCard
      title="Click heatmap"
      subtitle="Clicks on one page in this period"
      tone="orange"
      fill={false}
    >
      <div className={classes.toolbar}>
        <div className={classes.picker}>
          {quick.length > 0 && (
            <SegmentedControl
              size="xs"
              value={quick.includes(path ?? "") ? path ?? "" : ""}
              onChange={setPicked}
              data={quick}
              className={classes.pickerControl}
              aria-label="Page"
            />
          )}
          {rest.length > 0 && (
            <Select
              size="xs"
              placeholder="More pages"
              data={rest}
              value={rest.includes(path ?? "") ? path : null}
              onChange={(v) => v && setPicked(v)}
              searchable
              className={classes.more}
              aria-label="More pages"
            />
          )}
        </div>
        <HeatmapDeviceSwitch value={device} onChange={setDevice} />
      </div>

      {pagesLoading && !pagesData ? (
        <ChartSkeleton height={420} bare />
      ) : pagesFailed ? (
        <RankEmpty icon={Inbox}>Heatmaps couldn&apos;t load. Refresh to try again.</RankEmpty>
      ) : pages.length === 0 ? (
        <RankEmpty icon={Inbox}>
          No {device} clicks in this range yet. Check that the snippet on your site includes
          data-heatmap=&quot;on&quot;, or try another device.
        </RankEmpty>
      ) : (
        <div className={classes.layout}>
          <div className={classes.stage}>
            {heatmapLoading || !heatmap ? (
              <ChartSkeleton height={420} bare />
            ) : (
              <HeatmapFrame heatmap={heatmap} host={host} />
            )}
          </div>

          <aside className={classes.side}>
            {heatmap && <HeatmapSummary heatmap={heatmap} visits={current?.sessions ?? 0} />}
            <div className={classes.pages}>
              {onPage.length > 0 ? (
                <RankList
                  limit={6}
                  columns={{ label: "Most clicked", value: "Clicks" }}
                  items={onPage.map((c) => ({
                    id: c.key,
                    label: c.key,
                    title: c.href ?? c.key,
                    weight: c.count,
                    value: num(c.count),
                  }))}
                />
              ) : (
                <p className={classes.note}>No named buttons or links were clicked on this page.</p>
              )}
            </div>
            <p className={classes.note}>
              Brighter spots mean more clicks. The page drawing is a stand-in for the live page.
              {halfway !== null && ` Half of visitors have left by ${halfway}% down the page.`}
            </p>
          </aside>
        </div>
      )}
    </RankCard>
  );
}
