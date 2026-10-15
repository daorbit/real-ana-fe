import { Box, Skeleton, Stack } from "@mantine/core";
import classes from "./ConnectionCardSkeleton.module.css";

export function ConnectionCardSkeleton() {
  return (
    <Box className={`connection-card ${classes.card}`} aria-hidden>
      <Skeleton height={48} width={48} radius={12} />
      <Skeleton height={14} width="38%" radius="sm" mt="md" />
      <Stack gap={8} mt={10} className={classes.lines}>
        <Skeleton height={10} width="92%" radius="sm" />
        <Skeleton height={10} width="64%" radius="sm" />
      </Stack>
      <Skeleton height={10} width="70%" radius="sm" mt="md" />
      <Skeleton height={32} width={150} radius="md" mt={10} />
    </Box>
  );
}

export function ConnectionGridSkeleton({ count }: { count: number }) {
  return (
    <div className="connection-grid" aria-busy="true" aria-label="Loading connections">
      {Array.from({ length: count }, (_, index) => (
        <ConnectionCardSkeleton key={index} />
      ))}
    </div>
  );
}
