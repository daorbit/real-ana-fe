import { Button, Stack, Text } from "@mantine/core";
import type { LucideIcon } from "lucide-react";

/**
 * The empty-state pattern for the whole app: an icon, a line, an optional
 * action — floating directly on the page rather than boxed in a bordered
 * card. A card around "there is nothing here" doubles the message: it draws
 * a frame around empty space as though the frame itself were content. The
 * icon carries a slow float so the state reads as alive rather than as a
 * page that failed to load.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  minHeight = 360,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; disabled?: boolean; icon?: LucideIcon };
  minHeight?: number;
}) {
  return (
    <Stack
      align="center"
      justify="center"
      gap={0}
      className="empty-state"
      style={{ minHeight, textAlign: "center" }}
    >
      <div className="empty-state__icon" aria-hidden>
        <Icon size={40} strokeWidth={1.25} />
      </div>
      <Text fw={650} fz="lg" mt="lg">{title}</Text>
      {description && (
        <Text size="sm" c="dimmed" mt={6} style={{ maxWidth: "42ch", lineHeight: 1.6 }}>
          {description}
        </Text>
      )}
      {action && (
        <Button
          mt="xl"
          size="md"
          leftSection={action.icon ? <action.icon size={16} /> : undefined}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </Stack>
  );
}
