import type { ReactNode } from "react";
import { ActionIcon } from "@mantine/core";
import { MessageCircle, Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TelegramChat } from "@/shared/types";
import classes from "./Telegram.module.css";

export function chatTypeLabel(type: string, t: (key: string) => string): string {
  if (type === "private") return t("reports.tgTypePrivate");
  if (type === "channel") return t("reports.tgTypeChannel");
  return t("reports.tgTypeGroup");
}

export function TelegramChatRow({
  chat,
  leading,
  trailing,
  onRemove,
}: {
  chat: TelegramChat;
  leading?: ReactNode;
  trailing?: ReactNode;
  onRemove?: () => void;
}) {
  const { t } = useTranslation();
  const Icon = chat.type === "private" ? MessageCircle : Users;

  return (
    <div className={classes.row}>
      {leading}
      <Icon size={14} className={classes.chatIcon} />
      <span className={classes.rowTitle}>{chat.title}</span>
      <span className={classes.rowTag}>{chatTypeLabel(chat.type, t)}</span>
      {trailing}
      {onRemove && (
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          onClick={onRemove}
          aria-label={t("reports.tgRemoveChat", { title: chat.title })}
        >
          <X size={14} />
        </ActionIcon>
      )}
    </div>
  );
}
