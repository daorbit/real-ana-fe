import { Bricks } from "@/shared/ui/Bricks";
import { brickRows, type BrickRow } from "@/shared/lib/brickRows";

const ROWS: BrickRow[] = [{ height: 112 }, { height: 40 }, ...brickRows(4, 64)];

export function MembersSkeleton() {
  return <Bricks rows={ROWS} label="Loading members" />;
}
