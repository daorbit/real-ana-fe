import { Bricks } from "@/shared/ui/Bricks";
import { brickRows } from "@/shared/lib/brickRows";
import styles from "./ActivityDrawer.module.css";

const ROWS = brickRows(6, 64);

export function ActivitySkeleton() {
  return (
    <div className={styles.skeleton}>
      <Bricks rows={ROWS} label="Loading notifications" />
    </div>
  );
}
