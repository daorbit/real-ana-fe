import { Skeleton } from "@mantine/core";

export function WidgetSkeleton({ bare = false }: { bare?: boolean }) {
  return <Skeleton height={bare ? 96 : 220} radius="lg" />;
}
