import { useEffect, useRef, useState, useCallback } from "react";
import { Button, Group, Text, Tooltip } from "@mantine/core";
import { RotateCw } from "lucide-react";

export const POLL_MS = 60_000; // 1 minute

/**
 * Runs `load` on mount, then every POLL_MS. Also exposes a manual refresh
 * that shows a spinner and restarts the interval so the next auto-poll is a
 * full minute after the manual one.
 */
export function usePolling(load: () => Promise<void> | void, deps: unknown[]) {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const loadRef = useRef(load);
  loadRef.current = load;

  const run = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      await loadRef.current();
      setLastUpdated(new Date());
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  const schedule = useCallback(() => {
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => run(false), POLL_MS);
  }, [run]);

  const refresh = useCallback(async () => {
    await run(true);
    schedule(); // reset the clock after a manual refresh
  }, [run, schedule]);

  useEffect(() => {
    run(false);
    schedule();
    return () => window.clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { refresh, refreshing, lastUpdated };
}

function ago(d: Date | null): string {
  if (!d) return "never";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return `${m}m ago`;
}

export function RefreshButton({
  onRefresh,
  refreshing,
  lastUpdated,
  compact,
}: {
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdated: Date | null;
  compact?: boolean;
}) {
  // Re-render every 15s so the "x ago" label stays honest.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((t) => t + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Group gap="xs" wrap="nowrap">
      {!compact && (
        <Text size="xs" c="dimmed">Updated {ago(lastUpdated)}</Text>
      )}
      <Tooltip label="Auto-refreshes every minute" withArrow>
        <Button
          size={compact ? "compact-xs" : "xs"}
          variant="default"
          onClick={onRefresh}
          leftSection={<RotateCw size={13} className={refreshing ? "spin" : undefined} />}
        >
          Refresh
        </Button>
      </Tooltip>
    </Group>
  );
}
