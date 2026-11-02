import { Button, Group, Text } from "@mantine/core";
import classes from "./IntegrationTileCard.module.css";

export type FooterTone = "ok" | "idle" | "warn" | "paused";

export interface ConnectionFooterProps {
  tone: FooterTone;
  label: string;
  action: string;
  variant: "default" | "light" | "filled";
  color?: string;
  busy?: boolean;
  disabled?: boolean;
  celebrate?: boolean;
  ariaLabel: string;
  onAction: () => void;
}

export function ConnectionFooter({
  tone,
  label,
  action,
  variant,
  color,
  busy,
  disabled,
  celebrate,
  ariaLabel,
  onAction,
}: ConnectionFooterProps) {
  return (
    <Group gap="sm" wrap="nowrap" className={classes.footer}>
      <Group gap={7} wrap="nowrap" className={classes.status}>
        <span className={classes.dot} data-tone={celebrate ? "ok" : tone} aria-hidden />
        <Text size="xs" c={celebrate ? "green" : "dimmed"} fw={celebrate ? 600 : undefined} truncate aria-live="polite">
          {celebrate ? "Connected just now" : label}
        </Text>
      </Group>
      <Button
        type="button"
        size="xs"
        variant={variant}
        color={color}
        loading={busy}
        disabled={disabled}
        onClick={onAction}
        className={classes.action}
        aria-label={ariaLabel}
      >
        {action}
      </Button>
    </Group>
  );
}
