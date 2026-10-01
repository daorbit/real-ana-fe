import { Skeleton } from "@mantine/core";
import styles from "./ActivityDrawer.module.css";

export function ActivitySkeleton() {
  return (
    <div className={styles.skeleton}>
      <Skeleton height={10} width={60} radius="xl" className={styles.skeletonLabel} />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <Skeleton height={36} width={36} radius={10} />
          <div className={styles.skeletonLines}>
            <Skeleton height={10} width="58%" radius="xl" />
            <Skeleton height={8} width="88%" radius="xl" />
            <Skeleton height={8} width="30%" radius="xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
