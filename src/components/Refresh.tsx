import { useEffect, useState } from "react";
import { Button, Group, Text, Tooltip } from "@mantine/core";
import { RotateCw } from "lucide-react";
import { timeAgo } from "../utils";

export function RefreshButton({
  onRefresh,
  refreshing,
  lastUpdated,
  /** Renders a small button without the "Updated x ago" label — for inline use. */
  compact,
}: {
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdated: Date | null;
  compact?: boolean;
}) {
  // Re-render every 15s so the "x ago" label stays honest between polls.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((t) => t + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Group gap="xs" wrap="nowrap">
      {!compact && (
        <Text size="xs" c="dimmed" className="refresh-ago">
          Updated {timeAgo(lastUpdated)}
        </Text>
      )}
      <Tooltip label="Auto-refreshes every minute" withArrow>
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
