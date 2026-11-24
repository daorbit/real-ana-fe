import type { ReactNode } from "react";
import { SEARCH_CONSOLE_TABS, tabHasFilters, type SearchConsoleTabId } from "../../searchConsoleTabs";
import { Bone } from "../SkeletonBone";
import segmented from "../segmented.module.css";
import classes from "../skeleton.module.css";
import layout from "../searchConsole.module.css";
import { IndexingSkeleton, LinksSkeleton, SitemapsSkeleton, VitalsSkeleton } from "./health";
import { Loading } from "./parts";
import { DevicesSkeleton, InsightsSkeleton, OverviewSkeleton } from "./reports";
import { range } from "./shape";
import { BreakdownSkeleton } from "./tables";

const TAB_BODIES: Record<SearchConsoleTabId, ReactNode> = {
  overview: <OverviewSkeleton />,
  insights: <InsightsSkeleton />,
  queries: <BreakdownSkeleton chevron />,
  pages: <BreakdownSkeleton chevron />,
  countries: <BreakdownSkeleton />,
  devices: <DevicesSkeleton />,
  appearance: <BreakdownSkeleton chevron />,
  vitals: <VitalsSkeleton />,
  indexing: <IndexingSkeleton />,
  links: <LinksSkeleton />,
  sitemaps: <SitemapsSkeleton />,
};

function ToolbarSkeleton() {
  return (
    <div className={layout.toolbar}>
      <div className={layout.headerText}>
        <Bone w={32} h={32} shape="block" strong />
        <div className={classes.stack}>
          <Bone w={160} h={14} strong />
          <Bone w={260} h={11} />
        </div>
      </div>
      <div className={classes.toolbarRight}>
        <Bone w={78} h={32} shape="block" />
        <Bone w={250} h={32} shape="block" />
        {range(2).map((i) => (
          <Bone key={i} w={32} h={32} shape="circle" />
        ))}
      </div>
    </div>
  );
}

function TabsSkeleton({ tab }: { tab: SearchConsoleTabId }) {
  return (
    <div className={`${segmented.seg} ${classes.tabs}`} aria-hidden>
      {SEARCH_CONSOLE_TABS.map((item) => (
        <span key={item.id} className={segmented.item} data-on={item.id === tab || undefined}>
          <Bone w={Math.round(item.label.length * 6.6)} h={11} strong={item.id === tab} />
        </span>
      ))}
    </div>
  );
}

export function ConsoleSkeleton({ tab = "overview" }: { tab?: SearchConsoleTabId }) {
  return (
    <Loading label="Loading Search visibility" className={layout.page}>
      <ToolbarSkeleton />
      <div className={layout.tabHead}>
        <TabsSkeleton tab={tab} />
        <Bone w={420} h={12} />
        {tabHasFilters(tab) && <Bone w={108} h={32} shape="block" />}
      </div>
      {TAB_BODIES[tab]}
    </Loading>
  );
}
