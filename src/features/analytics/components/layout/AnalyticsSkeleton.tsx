import { Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";

const PANEL_ROWS: BrickRow[] = [{ height: 380, cols: 2 }];

const PAGE_ROWS: BrickRow[] = [
  { height: 168, cols: 4 },
  { height: 168, cols: 4 },
  { height: 370, split: "lead" },
  { height: 320, cols: 2 },
];

export function AnalyticsPanelSkeleton() {
  return <Bricks rows={PANEL_ROWS} label="Loading analytics" />;
}

export function AnalyticsSkeleton() {
  return <Bricks rows={PAGE_ROWS} label="Loading analytics" />;
}
