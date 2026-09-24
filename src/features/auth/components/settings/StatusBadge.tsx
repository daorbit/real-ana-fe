import { Badge } from "@mantine/core";

export function StatusBadge({ on, onLabel = "On", offLabel = "Off" }: { on: boolean; onLabel?: string; offLabel?: string }) {
  return (
    <Badge size="sm" variant="light" color={on ? "green" : "gray"}>
      {on ? onLabel : offLabel}
    </Badge>
  );
}
