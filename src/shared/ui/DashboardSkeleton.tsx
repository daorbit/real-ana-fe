import { Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";

const ROWS: BrickRow[] = [
  { height: 150, cols: 4 },
  { height: 340, split: "lead" },
  { height: 220, cols: 3 },
];

const ROWS_WITH_HERO: BrickRow[] = [{ height: 150 }, ...ROWS];

export function DashboardSkeleton({ hero = false }: { hero?: boolean }) {
  return <Bricks rows={hero ? ROWS_WITH_HERO : ROWS} />;
}
