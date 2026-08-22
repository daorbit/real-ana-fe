import { Button, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";
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
  actionNote,
  minHeight = "60vh",
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Either a handler or a route — an empty state's action is as often "go
   *  somewhere to create the missing thing" as it is "do something here", and
   *  a router link keeps that a real anchor rather than a scripted push. */
  action?: {
    label: string;
    onClick?: () => void;
    to?: string;
    disabled?: boolean;
    icon?: LucideIcon;
    loading?: boolean;
  };
  /** A line under the button — a caveat about the action rather than the
   *  empty state itself, e.g. "Takes a few seconds, costs no quota." */
  actionNote?: string;
  minHeight?: number | string;
  /** Smaller icon and no forced min-height, for a panel nested inside a page
   *  that already has plenty else on it — the SEO/Compare panels use this so
   *  the empty state doesn't push the rest of the page far down the screen. */
  compact?: boolean;
}) {
  return (
    <Stack
      align="center"
      justify="center"
      gap={0}
      className="empty-state"
      style={{ minHeight: compact ? undefined : minHeight, textAlign: "center", padding: compact ? "40px 20px" : undefined }}
    >
      <div className="empty-state__icon" data-size={compact ? "sm" : "md"} aria-hidden>
        <Icon size={compact ? 26 : 40} strokeWidth={1.25} />
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
          loading={action.loading}
          onClick={action.onClick}
          {...(action.to ? { component: Link, to: action.to } : {})}
        >
          {action.label}
        </Button>
      )}
      {actionNote && (
        <Text size="xs" c="dimmed" mt="sm">{actionNote}</Text>
      )}
    </Stack>
  );
}
