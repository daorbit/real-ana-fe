import { Skeleton } from "@mantine/core";
import classes from "@/features/alerts/components/Alerts.module.css";

export function AlertsSkeleton() {
  return (
    <>
      <Skeleton height={76} radius="lg" mb={18} />
      <div className={classes.layout}>
        <Skeleton height={420} radius="lg" />
        <div className={classes.side}>
          <Skeleton height={240} radius="lg" />
          <Skeleton height={200} radius="lg" />
        </div>
      </div>
    </>
  );
}
