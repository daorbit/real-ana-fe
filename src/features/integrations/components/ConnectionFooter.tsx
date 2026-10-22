import type { ReactNode } from "react";
import { Button, Group, Text } from "@mantine/core";
import classes from "./IntegrationTileCard.module.css";

export interface ConnectionFooterProps {
  icon: ReactNode;
  label: string;
  action: string;
  actionIcon: ReactNode;
  variant: "default" | "light";
  color?: string;
  busy?: boolean;
  disabled?: boolean;
  celebrate?: boolean;
  ariaLabel: string;
  onAction: () => void;
}

export function ConnectionFooter({
  icon,
  label,
  action,
  actionIcon,
  variant,
  color,
  busy,
  disabled,
  celebrate,
  ariaLabel,
  onAction,
}: ConnectionFooterProps) {
  return (
    <Group justify="space-between" gap="sm" wrap="nowrap" className={classes.footer}>
      <Group gap={8} wrap="nowrap" className={classes.status}>
        {icon}
        <Text size="xs" c={celebrate ? "green" : "dimmed"} fw={celebrate ? 600 : undefined} truncate aria-live="polite">
          {celebrate ? "Connected just now" : label}
        </Text>
      </Group>
      <Button
        type="button"
        size="xs"
        radius="md"
        variant={variant}
        color={color}
        loading={busy}
        disabled={disabled}
        leftSection={actionIcon}
        onClick={onAction}
        className={classes.action}
        aria-label={ariaLabel}
      >
        {action}
      </Button>
    </Group>
  );
}

export const footerIconClass = {
  ok: classes.ok,
  idle: classes.idle,
  warn: classes.warn,
  paused: classes.paused,
};
