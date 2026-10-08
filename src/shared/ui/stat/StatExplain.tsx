import { useState } from "react";
import { ActionIcon, CloseButton, Group, Loader, Popover, Text } from "@mantine/core";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";

export function StatExplain({
  onExplain,
  explaining,
  explanation,
  explainError,
}: {
  onExplain: () => void;
  explaining?: boolean;
  explanation?: string | null;
  explainError?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover width={280} position="bottom-end" withArrow shadow="md" opened={open} onClose={() => setOpen(false)}>
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="xs"
          onClick={() => {
            const opening = !open;
            setOpen(opening);
            if (opening) onExplain();
          }}
          aria-label="Why did this change? — ask Orbit"
        >
          {explaining ? <Loader size={10} /> : <OrbitMark size={14} />}
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Group justify="space-between" wrap="nowrap" mb={6} gap={8}>
          <Text size="xs" fw={600} c="dimmed">Orbit</Text>
          <CloseButton size="xs" onClick={() => setOpen(false)} />
        </Group>
        <Text size="xs" c={explainError ? "red" : undefined}>
          {explaining ? "Thinking…" : explainError ?? explanation ?? ""}
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
}
