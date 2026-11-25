import { Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";

const ROWS: BrickRow[] = [{ height: 104, cols: 5 }, { height: 44 }, { height: 420 }];

export function BacklinksSkeleton() {
  return <Bricks rows={ROWS} label="Loading backlinks" />;
}
