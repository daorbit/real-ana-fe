import type { ReactNode } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { MessageCircle, Trash2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { timeAgo } from "@/shared/lib/format";
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
  const removeLabel = t("reports.tgRemoveChat", { title: chat.title });

  return (
    <div className={classes.row}>
      {leading}
      <span className={classes.rowIcon}>
        <Icon size={15} />
      </span>
      <div className={classes.rowText}>
        <div className={classes.rowTitle}>{chat.title}</div>
        <div className={classes.rowTag}>
          {chatTypeLabel(chat.type, t)}
          {chat.linkedAt && ` · linked ${timeAgo(chat.linkedAt)}`}
        </div>
      </div>
      {trailing}
      {onRemove && (
        <Tooltip label={removeLabel} withArrow>
          <ActionIcon size="md" variant="subtle" color="gray" onClick={onRemove} aria-label={removeLabel}>
            <Trash2 size={15} />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  );
}
