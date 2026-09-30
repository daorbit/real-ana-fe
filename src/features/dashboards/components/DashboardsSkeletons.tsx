import { Skeleton } from "@mantine/core";
import classes from "@/features/dashboards/components/Dashboards.module.css";

function CardSkeleton({ preview }: { preview: number }) {
  return (
    <div className={classes.skeletonCard}>
      <Skeleton height={preview} radius={0} />
      <div className={classes.skeletonBody}>
        <Skeleton height={14} width="55%" radius="sm" />
        <Skeleton height={10} width="80%" radius="sm" />
        <Skeleton height={10} width="40%" radius="sm" />
      </div>
    </div>
  );
}

export function DashboardListSkeleton() {
  return (
    <>
      <div className={classes.skeletonHeader}>
        <Skeleton height={30} width={210} radius="sm" />
        <Skeleton height={12} width={380} radius="sm" />
      </div>
      <div className={classes.skeletonTabs}>
        <Skeleton height={14} width={110} radius="sm" />
        <Skeleton height={14} width={140} radius="sm" />
      </div>
      <div className={classes.grid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} preview={172} />
        ))}
      </div>
    </>
  );
}

export function DashboardWelcomeSkeleton() {
  return (
    <div className={classes.gallery}>
      <div className={classes.skeletonIntro}>
        <Skeleton height={36} width={420} maw="100%" radius="sm" />
        <Skeleton height={12} width={480} maw="100%" radius="sm" />
        <Skeleton height={12} width={320} maw="100%" radius="sm" />
      </div>
      <div className={classes.browser}>
        <div className={classes.side}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={36} radius={10} mb={4} />
          ))}
          <Skeleton height={112} radius={14} mt={14} />
        </div>
        <div className={classes.sections}>
          <section>
            <div className={classes.sectionHead}>
              <Skeleton height={16} width={100} radius="sm" />
              <Skeleton height={12} width={240} radius="sm" />
            </div>
            <div className={classes.galleryGrid}>
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} preview={168} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
