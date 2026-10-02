import { isSearchWidget } from "@/features/analytics/widgetCatalog";
import type { Placed } from "@/features/analytics/widgetCatalog";
import { SearchWidgetsProvider } from "@/features/searchConsole/widgets/SearchWidgetsProvider";
import { SearchConnectionBanner } from "@/features/searchConsole/widgets/SearchConnectionBanner";
import { WidgetGrid } from "@/features/analytics/components/widgets/WidgetGrid";
import { WidgetRenderer } from "@/features/analytics/components/widgets/WidgetRenderer";
import { WidgetFrame } from "@/features/dashboards/components/WidgetFrame";
import { useDashboardData } from "@/features/dashboards/hooks/useDashboardData";
import type { DashboardRange } from "@/features/dashboards/types";

const noop = () => undefined;

export function PreviewWidgets({
  workspaceId,
  layout,
  range,
  fresh,
}: {
  workspaceId: string;
  layout: Placed[];
  range: DashboardRange;
  fresh: ReadonlySet<string>;
}) {
  const { widgetData, sites, siteScope } = useDashboardData(workspaceId, range);
  const hasSearch = layout.some((p) => isSearchWidget(p.id));

  return (
    <SearchWidgetsProvider workspaceId={workspaceId}>
      {hasSearch && <SearchConnectionBanner workspaceId={workspaceId} sites={sites} siteScope={siteScope} range={range} />}
      <WidgetGrid
        layout={layout}
        editing={false}
        onMove={noop}
        onSpan={noop}
        onRemove={noop}
        render={(wid) => (
          <WidgetFrame fresh={fresh.has(wid)}>
            <WidgetRenderer id={wid} data={widgetData} />
          </WidgetFrame>
        )}
      />
    </SearchWidgetsProvider>
  );
}
