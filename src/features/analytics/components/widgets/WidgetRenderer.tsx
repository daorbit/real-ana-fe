import { Suspense, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsFilterHref } from "@/features/analytics/lib/analyticsLinks";
import { MetricTile } from "@/shared/ui/MetricTile";
import { percentChange } from "@/shared/lib/metricChange";
import { num } from "@/shared/lib";
import { Heatmap } from "@/shared/ui/Heatmap";
import { ChartSkeleton } from "@/shared/ui/Skeletons";
import { ClicksPanel } from "@/features/analytics/components/ClicksPanel";
import { ScrollPanel, LandingPanel } from "@/features/analytics/components/EngagementPanels";
import { OutboundPanel, ErrorsPanel } from "@/features/analytics/components/OutboundErrorsPanels";
import { MiniList } from "@/features/analytics/components/widgets/MiniList";
import { TrafficCard } from "@/features/analytics/components/widgets/TrafficCard";
import { LivePagesCard } from "@/features/analytics/components/widgets/LivePagesCard";
import { METRIC_TONE, listSources, metricSources } from "@/features/analytics/components/widgets/widgetSources";
import {
  SearchWidget, SeoScoreCard, TargetsWidget, WorldMap,
} from "@/features/analytics/components/widgets/lazyWidgets";
import { isSearchWidget } from "@/features/analytics/widgetCatalog";
import type { WidgetId } from "@/features/analytics/widgetCatalog";
import type { Bucket, Site, Stats, StatsFilter } from "@/shared/types";

export type WidgetData = {
  stats: Partial<Stats> | null;
  live?: number;
  livePages?: Bucket[];
  liveCountries?: Bucket[];
  sites?: Site[];
  siteScope?: string[];
  workspaceId?: string;
  trafficTitle?: string;
  embedded?: boolean;
  range?: string;
  filterLinks?: boolean;
};

function Deferred({ children }: { children: ReactNode }) {
  return <Suspense fallback={<ChartSkeleton height={160} />}>{children}</Suspense>;
}

export function WidgetRenderer({ id, data }: { id: WidgetId; data: WidgetData }) {
  const { stats, sites = [], siteScope = [], workspaceId, embedded = false } = data;
  const live = data.live ?? stats?.live ?? 0;
  const navigate = useNavigate();
  const openFiltered = (key: keyof StatsFilter | undefined) =>
    key && data.filterLinks && !embedded ? (value: string) => navigate(analyticsFilterHref(key, value)) : undefined;

  const metric = metricSources(stats, live, sites.length)[id];
  if (metric) {
    return (
      <MetricTile
        id={id}
        label={metric.label}
        color={METRIC_TONE[metric.color] ?? METRIC_TONE.emerald}
        value={typeof metric.value === "number" ? num(metric.value) : metric.value}
        change={percentChange(metric.delta, metric.inverseDelta)}
        spark={metric.spark}
        sparkKey={metric.sparkKey ?? "views"}
        live={metric.live}
        tinted
      />
    );
  }

  const list = listSources(stats)[id];
  if (list) {
    const { filterKey, ...listProps } = list;
    return <MiniList {...listProps} onSelect={openFiltered(filterKey)} />;
  }

  switch (id) {
    case "traffic":
      return <TrafficCard stats={stats} title={data.trafficTitle} embedded={embedded} />;
    case "livePages":
      return <LivePagesCard live={live} pages={data.livePages ?? []} />;
    case "worldMap":
      return (
        <Deferred>
          <WorldMap countries={stats?.countries ?? []} liveCountries={data.liveCountries} />
        </Deferred>
      );
    case "clicks":
      return <ClicksPanel clicks={stats?.clicks ?? []} total={stats?.clickCount ?? 0} />;
    case "heatmap":
      return <Heatmap cells={stats?.heatmap ?? []} />;
    case "scrollDepth":
      return <ScrollPanel items={stats?.scrollDepth ?? []} onSelectPath={openFiltered("path")} />;
    case "landingPages":
      return <LandingPanel items={stats?.landingPages ?? []} onSelectPath={openFiltered("path")} />;
    case "outbound":
      return <OutboundPanel items={stats?.outboundClicks ?? []} />;
    case "errors":
      return <ErrorsPanel items={stats?.errors ?? []} />;
  }

  if (!workspaceId) return null;

  if (isSearchWidget(id)) {
    return (
      <Deferred>
        <SearchWidget id={id} workspaceId={workspaceId} sites={sites} siteScope={siteScope} range={data.range} />
      </Deferred>
    );
  }

  if (id === "targets") {
    return (
      <Deferred>
        <TargetsWidget workspaceId={workspaceId} />
      </Deferred>
    );
  }
  if (id === "seoScore") {
    const seoSite = (siteScope.length === 1 && sites.find((s) => s.siteId === siteScope[0])) || sites[0];
    return (
      <Deferred>
        <SeoScoreCard
          workspaceId={workspaceId}
          siteId={seoSite?.siteId ?? ""}
          siteName={sites.length > 1 ? seoSite?.name : undefined}
        />
      </Deferred>
    );
  }
  return null;
}
