import { Skeleton } from "@mantine/core";
import home from "@/features/dashboards/components/home/Home.module.css";
import templates from "@/features/dashboards/components/templates/Templates.module.css";

function HeaderSkeleton() {
  return (
    <div className={home.skeletonHeader}>
      <div className={home.skeletonHeaderRow}>
        <div className={home.skeletonStack}>
          <Skeleton height={30} width={190} radius="sm" />
          <Skeleton height={12} width={360} maw="100%" radius="sm" />
        </div>
        <div className={home.skeletonInline}>
          <Skeleton height={36} width={150} radius={10} />
          <Skeleton height={36} width={36} radius={10} />
        </div>
      </div>
      <Skeleton height={42} width={320} maw="100%" radius={12} />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className={home.skeletonCard}>
      <div className={home.skeletonPreview}>
        <div className={home.skeletonWindow}>
          <div className={home.skeletonKpis}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={26} radius={6} />
            ))}
          </div>
          <Skeleton height={58} radius={6} />
        </div>
      </div>
      <div className={home.skeletonBody}>
        <Skeleton height={38} width={38} radius={11} />
        <div className={home.skeletonLines}>
          <Skeleton height={14} width="62%" radius="sm" />
          <Skeleton height={10} width="44%" radius="sm" />
        </div>
      </div>
      <div className={home.skeletonFoot}>
        <Skeleton height={10} width={90} radius="sm" />
        <Skeleton height={10} width={70} radius="sm" />
      </div>
    </div>
  );
}

export function DashboardListSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <div className={home.library}>
        <div className={home.libraryHead}>
          <Skeleton height={14} width={120} radius="sm" />
          <div className={home.skeletonInline}>
            <Skeleton height={36} width={260} radius={8} />
            <Skeleton height={36} width={160} radius={8} />
            <Skeleton height={36} width={78} radius={10} />
          </div>
        </div>
        <div className={home.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
          <div className={home.skeletonNew} />
        </div>
      </div>
    </>
  );
}

export function DashboardWelcomeSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <div className={home.start}>
        <div className={home.options}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={188} radius={20} />
          ))}
        </div>
        <div>
          <Skeleton height={18} width={180} radius="sm" mb="md" />
          <div className={templates.grid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
