import type { ReactNode } from "react";
import { Text, UnstyledButton } from "@mantine/core";
import { CircleCheck, Circle } from "lucide-react";
import classes from "./Telegram.module.css";

interface Props {
  avatar: ReactNode;
  title: string;
  description: ReactNode;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function TelegramBotOption({ avatar, title, description, active, disabled, onClick }: Props) {
  return (
    <UnstyledButton
      type="button"
      className={classes.mode}
      data-active={active || undefined}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className={classes.modeAvatar}>{avatar}</span>
      <span className={classes.modeText}>
        <Text size="sm" fw={600}>
          {title}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {description}
        </Text>
      </span>
      {active ? (
        <CircleCheck size={18} className={classes.modeCheck} />
      ) : (
        <Circle size={18} className={classes.modeIdle} />
      )}
    </UnstyledButton>
  );
}
