import { Box, Button, Group, Text } from "@mantine/core";
import { Check } from "lucide-react";
import { describe, type Draft } from "../draft";

export function PlanConfirm({
  draft,
  blockedReason,
  scheduling,
  onSchedule,
  onEdit,
}: {
  draft: Draft;
  blockedReason?: string;
  scheduling: boolean;
  onSchedule: () => void;
  onEdit: () => void;
}) {
  return (
    <Box
      p={14}
      style={{
        border: "1px solid var(--accent)",
        borderRadius: "var(--mantine-radius-md)",
        background: "var(--surface)",
      }}
    >
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: "0.04em" }}>
        Publishes
      </Text>
      <Text size="sm" fw={600} mt={4} mb={blockedReason ? 6 : 12}>
        {describe(draft)}
      </Text>
      {blockedReason && <Text size="xs" c="red" mb={12}>{blockedReason}</Text>}
      <Group gap="sm" wrap="nowrap">
        <Button
          size="xs"
          color="emerald"
          loading={scheduling}
          disabled={!!blockedReason}
          leftSection={<Check size={14} />}
          onClick={onSchedule}
        >
          Schedule it
        </Button>
        <Button size="xs" variant="default" onClick={onEdit} disabled={scheduling}>
          Edit first
        </Button>
      </Group>
    </Box>
  );
}
