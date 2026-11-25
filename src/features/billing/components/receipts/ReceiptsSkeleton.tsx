import { Bricks } from "@/shared/ui/Bricks";
import { brickRows, type BrickRow } from "@/shared/lib/brickRows";

const ROWS: BrickRow[] = [{ height: 92, cols: 3 }, ...brickRows(4, 68)];

export function ReceiptsSkeleton() {
  return <Bricks rows={ROWS} label="Loading receipts" />;
}
