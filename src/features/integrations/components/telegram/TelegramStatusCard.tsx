import { Button, Text } from "@mantine/core";
import { Send } from "lucide-react";
import { QuantalogMark } from "@/shared/ui/QuantalogMark";
import type { TelegramStatus } from "@/shared/types";
import { BrandMark } from "../logos/BrandMarks";
import classes from "./Telegram.module.css";

interface Props {
  status: TelegramStatus;
  testing: boolean;
  onTest: () => void;
}

function sender(status: TelegramStatus): string | null {
  const name = status.mode === "own" ? status.ownBot?.username : status.platformBot;
  return name ? `@${name}` : null;
}

export function TelegramStatusCard({ status, testing, onTest }: Props) {
  const live = status.chats.length > 0;
  const alerts = status.chats.filter((c) => c.formAlerts).length;
  const from = sender(status);
  const chats = status.chats.length;

  return (
    <header className={classes.status} data-live={live || undefined}>
      <span className={classes.statusAvatar}>
        {status.mode === "own" ? <BrandMark id="telegram" size={44} /> : <QuantalogMark size={44} />}
      </span>
      <div className={classes.statusText}>
        <span className={classes.statusPill}>
          <span className={classes.statusDot} aria-hidden />
          {live ? "Live" : "Not connected"}
        </span>
        <Text className={classes.statusTitle}>{live ? "Telegram is connected" : "Connect Telegram"}</Text>
        <Text size="sm" c="dimmed">
          {live
            ? `${from ? `Sending as ${from} to ` : "Sending to "}${chats} chat${chats === 1 ? "" : "s"}, ${alerts} with form alerts on.`
            : "Choose a bot, then link a chat, group or channel for reports and form alerts."}
        </Text>
      </div>
      {live && (
        <Button type="button" variant="default" leftSection={<Send size={15} />} loading={testing} onClick={onTest}>
          Send test message
        </Button>
      )}
    </header>
  );
}
