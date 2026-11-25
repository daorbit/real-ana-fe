import { Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";

const ROWS: BrickRow[] = [
  { height: 320, split: "trail" },
  { height: 220, split: "trail" },
  { height: 220, split: "trail" },
];

export function CompareSkeleton() {
  return <Bricks rows={ROWS} label="Loading competitors" />;
}
