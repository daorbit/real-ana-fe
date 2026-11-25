import { Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";

const ROWS: BrickRow[] = [{ height: 130, cols: 4 }, { height: 300, split: "lead" }, { height: 220, cols: 2 }];

export function PreviewSkeleton() {
  return <Bricks rows={ROWS} label="Loading preview" />;
}
