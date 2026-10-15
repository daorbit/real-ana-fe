import { ActionIcon, Checkbox } from "@mantine/core";
import { MessageCircle, Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TelegramChat } from "@/shared/types";
import reportClasses from "../Reports.module.css";
import classes from "./Telegram.module.css";

export function chatTypeLabel(type: string, t: (key: string) => string): string {
  if (type === "private") return t("reports.tgTypePrivate");
  if (type === "channel") return t("reports.tgTypeChannel");
  return t("reports.tgTypeGroup");
}

export function TelegramChatRow({
  chat,
  checked,
  onToggle,
  onRemove,
}: {
  chat: TelegramChat;
  checked: boolean;
  onToggle: (on: boolean) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const Icon = chat.type === "private" ? MessageCircle : Users;

  return (
    <div className={reportClasses.recipient}>
      <Checkbox
        size="xs"
        checked={checked}
        onChange={(e) => onToggle(e.currentTarget.checked)}
        aria-label={chat.title}
      />
      <Icon size={14} className={classes.chatIcon} />
      <span className={reportClasses.recipientEmail}>{chat.title}</span>
      <span className={reportClasses.recipientTag}>{chatTypeLabel(chat.type, t)}</span>
      <ActionIcon
        size="sm"
        variant="subtle"
        color="gray"
        onClick={onRemove}
        aria-label={t("reports.tgRemoveChat", { title: chat.title })}
      >
        <X size={14} />
      </ActionIcon>
    </div>
  );
}
