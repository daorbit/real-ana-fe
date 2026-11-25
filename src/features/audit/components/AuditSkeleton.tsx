import { Brick, Bricks } from "@/shared/ui/Bricks";
import { brickRows, type BrickRow } from "@/shared/lib/brickRows";
import classes from "./AuditLog.module.css";
import detail from "./AuditDetail.module.css";

const OVERVIEW_ROWS: BrickRow[] = [{ height: 104, cols: 4 }];
const ENTRY_HEIGHT = 64;

export function AuditOverviewSkeleton() {
  return <Bricks rows={OVERVIEW_ROWS} label="Loading activity summary" />;
}

export function AuditRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return <Bricks rows={brickRows(rows, ENTRY_HEIGHT)} label="Loading activity" />;
}

export function AuditSkeleton() {
  return (
    <div className={classes.layout}>
      <AuditRowsSkeleton rows={7} />
      <div className={detail.inspectorSkeleton}>
        <Brick height={320} />
      </div>
    </div>
  );
}
