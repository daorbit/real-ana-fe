import { Box, Group, Text } from "@mantine/core";
import { CalendarClock, CheckCircle2, Repeat, TriangleAlert } from "lucide-react";
import type { ScheduledPost } from "@/shared/types";
import { matches } from "../hooks/usePostFilters";

/**
 * The three numbers worth knowing before reading the list.
 *
 * Each carries the same mark and colour its rows carry below, so the strip
 * reads as a key to the list rather than four unrelated figures: the teal
 * clock at the top is the same teal clock beside every scheduled post.
 */
export function PostStats({ posts }: { posts: ScheduledPost[] }) {
  const scheduled = posts.filter((p) => matches(p, "scheduled")).length;
  const repeating = posts.filter((p) => matches(p, "repeating")).length;
  const published = posts.reduce((n, p) => n + p.postCount, 0);
  const failed = posts.filter((p) => matches(p, "failed")).length;

  return (
    <Group className="post-stats" gap={0} wrap="wrap">
      <Stat icon={<CalendarClock size={15} />} value={scheduled} label="Scheduled" tone="teal" />
      <Stat icon={<Repeat size={15} />} value={repeating} label="Repeating" tone="orange" />
      <Stat icon={<CheckCircle2 size={15} />} value={published} label="Published" tone="gray" />
      {/* Only when there is something wrong: a permanent "0 failed" spends a
          quarter of the strip on the absence of a problem. */}
      {failed > 0 && (
        <Stat icon={<TriangleAlert size={15} />} value={failed} label="Failed" tone="red" />
      )}
    </Group>
  );
}

function Stat({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: string;
}) {
  return (
    <Box className="post-stats__item">
      <Group gap={8} wrap="nowrap" align="center">
        <Box
          className="post-stats__icon"
          aria-hidden
          style={{
            color: `var(--mantine-color-${tone}-6)`,
            background: `var(--mantine-color-${tone}-light)`,
          }}
        >
          {icon}
        </Box>
        <Box style={{ minWidth: 0 }}>
          <Text fw={700} fz={24} lh={1.05} style={{ fontVariantNumeric: "tabular-nums" }}>
            {value}
          </Text>
          <Text size="xs" c="dimmed" mt={1}>{label}</Text>
        </Box>
      </Group>
    </Box>
  );
}
