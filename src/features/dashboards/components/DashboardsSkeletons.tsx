import { Brick, Bricks } from "@/shared/ui/Bricks";
import type { BrickRow } from "@/shared/lib/brickRows";

const LIST_ROWS: BrickRow[] = [{ height: 40 }, { height: 300, cols: 3 }];

const WELCOME_ROWS: BrickRow[] = [{ height: 440 }, { height: 236, cols: 4 }];

export function ViewSwitchSkeleton() {
  return <Brick height={42} width={320} />;
}

export function DashboardListSkeleton() {
  return <Bricks rows={LIST_ROWS} label="Loading dashboards" />;
}

export function DashboardWelcomeSkeleton() {
  return <Bricks rows={WELCOME_ROWS} label="Loading dashboards" />;
}
