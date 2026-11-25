import { Brick, Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";
import type { SearchConsoleTabId } from "../searchConsoleTabs";
import {
  BREAKDOWN_ROWS,
  DEVICES_ROWS,
  INDEXING_ROWS,
  INSIGHTS_ROWS,
  LINKS_ROWS,
  OVERVIEW_ROWS,
  PROPERTY_PICKER_ROWS,
  QUERY_SHEET_ROWS,
  SITEMAPS_ROWS,
  TABLE_ROWS,
  VITALS_ROWS,
  consoleRows,
} from "./searchSkeletonRows";

export function ConsoleSkeleton({ tab = "overview" }: { tab?: SearchConsoleTabId }) {
  return <Bricks rows={consoleRows(tab)} label="Loading Search visibility" />;
}

export function OverviewSkeleton() {
  return <Bricks rows={OVERVIEW_ROWS} label="Loading search performance" />;
}

export function InsightsSkeleton() {
  return <Bricks rows={INSIGHTS_ROWS} label="Loading insights" />;
}

export function BreakdownSkeleton() {
  return <Bricks rows={BREAKDOWN_ROWS} label="Loading report" />;
}

export function DevicesSkeleton() {
  return <Bricks rows={DEVICES_ROWS} label="Loading devices" />;
}

export function VitalsSkeleton() {
  return <Bricks rows={VITALS_ROWS} label="Loading Web vitals" />;
}

export function IndexingSkeleton() {
  return <Bricks rows={INDEXING_ROWS} label="Loading indexing" />;
}

export function LinksSkeleton() {
  return <Bricks rows={LINKS_ROWS} label="Loading links" />;
}

export function SitemapsSkeleton() {
  return <Bricks rows={SITEMAPS_ROWS} label="Loading sitemaps" />;
}

export function PropertyPickerSkeleton() {
  return <Bricks rows={PROPERTY_PICKER_ROWS} label="Loading properties" />;
}

export function DrawerSkeleton() {
  return <Bricks rows={QUERY_SHEET_ROWS} label="Loading query" />;
}

export function TableCardSkeleton() {
  return <Bricks rows={TABLE_ROWS} label="Loading table" />;
}

export function StatTilesSkeleton({ columns }: { columns: NonNullable<BrickRow["cols"]> }) {
  return <Bricks rows={[{ height: 158, cols: columns }]} label="Loading totals" />;
}

export function ChartCardSkeleton() {
  return <Brick height={340} />;
}

export function HourlyBodySkeleton() {
  return <Brick height={260} />;
}

export function IndexStatusSkeleton() {
  return <Brick height={300} />;
}
