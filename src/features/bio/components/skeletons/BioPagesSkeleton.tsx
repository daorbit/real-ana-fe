import { Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";

const ROWS: BrickRow[] = [{ height: 190, cols: 3 }];

export function BioPagesSkeleton() {
  return <Bricks rows={ROWS} label="Loading your pages" />;
}
