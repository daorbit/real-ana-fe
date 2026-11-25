import { Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";

const ROWS: BrickRow[] = [{ height: 180 }, { height: 360 }, { height: 280 }, { height: 220, cols: 2 }];

export function UsageTabSkeleton() {
  return <Bricks rows={ROWS} label="Loading usage" />;
}
