import { Brick, Bricks } from "@/shared/ui/Bricks";
import { brickRows, type BrickRow } from "@/shared/lib/brickRows";
import type { SeoTabId } from "../sections";

const OVERVIEW: BrickRow[] = [
  { height: 220, cols: 2 },
  { height: 120, cols: 4 },
  { height: 260, cols: 2 },
  { height: 300 },
];

const ISSUES: BrickRow[] = [{ height: 40 }, ...brickRows(7, 64)];

const PERFORMANCE: BrickRow[] = [{ height: 120, cols: 4 }, { height: 300 }, { height: 320 }];

const GROUPED: BrickRow[] = [{ height: 40 }, { height: 260 }, { height: 210, cols: 2 }];

function rowsFor(tab: SeoTabId): BrickRow[] {
  if (tab === "issues") return ISSUES;
  if (tab === "performance") return PERFORMANCE;
  if (tab === "onpage" || tab === "site") return GROUPED;
  return OVERVIEW;
}

export function SeoTabSkeleton({ tab }: { tab: SeoTabId }) {
  return <Bricks rows={rowsFor(tab)} label="Loading SEO report" />;
}

export function SeoInspectSkeleton() {
  return <Brick height={96} />;
}
