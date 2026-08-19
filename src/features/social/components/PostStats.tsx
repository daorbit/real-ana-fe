import { Box, Group, Text } from "@mantine/core";
import type { ScheduledPost } from "@/shared/types";
import { matches } from "../hooks/usePostFilters";

 
export function PostStats({ posts }: { posts: ScheduledPost[] }) {
  const scheduled = posts.filter((p) => matches(p, "scheduled")).length;
  const repeating = posts.filter((p) => matches(p, "repeating")).length;
  const published = posts.reduce((n, p) => n + p.postCount, 0);
  const failed = posts.filter((p) => matches(p, "failed")).length;

  return (
    <Group className="post-stats" gap={0} wrap="wrap">
      <Stat value={scheduled} label="Scheduled" />
      <Stat value={repeating} label="Repeating" />
      <Stat value={published} label="Published" />

      {failed > 0 && <Stat value={failed} label="Failed" tone="orange" />}
    </Group>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <Box className="post-stats__item">
      <Text fw={700} fz={22} lh={1.1} c={tone} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
      <Text size="xs" c="dimmed" mt={2}>{label}</Text>
    </Box>
  );
}
