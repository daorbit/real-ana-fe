import { useState } from "react";
import { ActionIcon, CloseButton, Group, Loader, Popover, Text, Tooltip } from "@mantine/core";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import type { ExplainProps } from "../useSearchOrbitExplain";

export function MetricExplainButton({
  onExplain,
  explaining,
  explanation,
  explainError,
  className,
}: ExplainProps & { className?: string }) {
  const [open, setOpen] = useState(false);
  if (!onExplain) return null;

  return (
    <Popover width={280} position="bottom-end" withArrow shadow="md" opened={open} onClose={() => setOpen(false)}>
      <Popover.Target>
        <Tooltip label="Why did this change? Ask Orbit" withArrow disabled={open}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size={24}
            radius="xl"
            className={className}
            onClick={() => {
              const opening = !open;
              setOpen(opening);
              if (opening) onExplain();
            }}
            aria-label="Why did this change? Ask Orbit"
          >
            {explaining ? <Loader size={11} /> : <OrbitMark size={14} />}
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Group justify="space-between" wrap="nowrap" mb={6} gap={8}>
          <Text size="xs" fw={600} c="dimmed">
            Orbit
          </Text>
          <CloseButton size="xs" onClick={() => setOpen(false)} />
        </Group>
        <Text size="xs" c={explainError ? "red" : undefined}>
          {explaining ? "Thinking…" : (explainError ?? explanation ?? "")}
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
}
