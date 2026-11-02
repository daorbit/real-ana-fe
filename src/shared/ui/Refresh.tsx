import { useEffect, useState } from "react";
import { ActionIcon, Button, Group, Text, Tooltip } from "@mantine/core";
import { RotateCw } from "lucide-react";
import { timeAgo } from "@/shared/lib";

export function RefreshButton({
  onRefresh,
  refreshing,
  lastUpdated,
  /** Renders a small button without the "Updated x ago" label — for inline use. */
  compact,
  iconOnly,
  hint = "Auto-refreshes every minute",
}: {
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdated: Date | null;
  compact?: boolean;
  iconOnly?: boolean;
  hint?: string;
}) {
  // Re-render every 15s so the "x ago" label stays honest between polls.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((t) => t + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  if (iconOnly) {
    return (
      <Tooltip label={`${hint} · Updated ${timeAgo(lastUpdated)}`} withArrow>
        <ActionIcon variant="default" size={36} radius="md" onClick={onRefresh} aria-label="Refresh">
          <RotateCw size={16} className={refreshing ? "spin" : undefined} />
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Group gap="xs" wrap="nowrap">
      {!compact && (
        <Text size="xs" c="dimmed" className="refresh-ago">
          Updated {timeAgo(lastUpdated)}
        </Text>
      )}
      <Tooltip label={hint} withArrow>
        <Button
          // Default size matches the other header buttons (Customize, Full analytics).
          size={compact ? "xs" : "sm"}
          variant="default"
          onClick={onRefresh}
          leftSection={<RotateCw size={15} className={refreshing ? "spin" : undefined} />}
        >
          Refresh
        </Button>
      </Tooltip>
    </Group>
  );
}
