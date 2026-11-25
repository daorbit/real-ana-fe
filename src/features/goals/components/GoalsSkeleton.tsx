import { Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";

const ROWS: BrickRow[] = [{ height: 250 }, { height: 250, cols: 3 }];

export function GoalsSkeleton() {
  return <Bricks rows={ROWS} label="Loading goals" />;
}
