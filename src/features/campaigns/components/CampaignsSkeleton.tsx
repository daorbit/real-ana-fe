import { Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";

const ROWS: BrickRow[] = [{ height: 112 }, { height: 290, cols: 3 }];

export function CampaignsSkeleton() {
  return <Bricks rows={ROWS} label="Loading campaigns" />;
}
