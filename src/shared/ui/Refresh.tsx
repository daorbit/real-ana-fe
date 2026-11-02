import { useEffect, useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { RotateCw } from "lucide-react";
import { timeAgo } from "@/shared/lib";

export function RefreshButton({
  onRefresh,
  refreshing,
  lastUpdated,
  hint = "Auto-refreshes every minute",
  label = "Refresh",
  disabled,
}: {
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdated?: Date | null;
  hint?: string;
  label?: string;
  disabled?: boolean;
}) {
  const tracksAge = lastUpdated !== undefined;
  const [, tick] = useState(0);
  useEffect(() => {
    if (!tracksAge) return;
    const id = window.setInterval(() => tick((t) => t + 1), 15_000);
    return () => window.clearInterval(id);
  }, [tracksAge]);

  return (
    <Tooltip label={tracksAge ? `${hint} · Updated ${timeAgo(lastUpdated)}` : hint} withArrow>
      <ActionIcon
        variant="default"
        size={36}
        radius="md"
        onClick={onRefresh}
        disabled={disabled}
        aria-label={label}
      >
        <RotateCw size={16} className={refreshing ? "spin" : undefined} />
      </ActionIcon>
    </Tooltip>
  );
}
