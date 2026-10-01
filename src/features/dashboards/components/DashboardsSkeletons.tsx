import { Box, Skeleton } from "@mantine/core";
import home from "@/features/dashboards/components/home/Home.module.css";
import templates from "@/features/dashboards/components/templates/Templates.module.css";

function HeaderSkeleton() {
  return (
    <Box mb="xl">
      <Skeleton height={30} width={210} radius="sm" />
      <Skeleton height={12} width={380} maw="100%" radius="sm" mt={12} />
      <Skeleton height={42} width={330} maw="100%" radius={12} mt="lg" />
    </Box>
  );
}

function CardSkeleton() {
  return (
    <div className={home.skeletonCard}>
      <Skeleton height={180} radius={0} />
      <div className={home.skeletonBody}>
        <Skeleton height={38} width={38} radius={11} />
        <div className={home.skeletonLines}>
          <Skeleton height={14} width="60%" radius="sm" />
          <Skeleton height={10} width="85%" radius="sm" />
        </div>
      </div>
    </div>
  );
}

export function DashboardListSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <div className={home.library}>
        <Skeleton height={300} radius={20} />
        <div>
          <Skeleton height={18} width={180} radius="sm" mb="md" />
          <div className={home.grid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
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
            <Skeleton key={i} height={176} radius={20} />
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
