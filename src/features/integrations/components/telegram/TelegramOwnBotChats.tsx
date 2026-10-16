import { Button, Text, TextInput } from "@mantine/core";
import { Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { useTelegramOwnBot } from "../../hooks/useTelegramOwnBot";
import { chatTypeLabel } from "./TelegramChatRow";
import classes from "./Telegram.module.css";

export function TelegramOwnBotChats({ bot }: { bot: ReturnType<typeof useTelegramOwnBot> }) {
  const { t } = useTranslation();

  return (
    <div className={classes.panel}>
      <div className={classes.inline}>
        <Text size="xs" c="dimmed" className={classes.grow}>
          {t("reports.tgFindHint")}
        </Text>
        <Button size="xs" variant="default" leftSection={<Search size={14} />} loading={bot.finding} onClick={bot.find}>
          {t("reports.tgFindChats")}
        </Button>
      </div>

      {bot.found && bot.found.length === 0 && (
        <Text size="xs" c="dimmed" mt="xs">
          {t("reports.tgFindNone")}
        </Text>
      )}

      {bot.found && bot.found.length > 0 && (
        <div className={`${classes.rows} ${classes.found}`}>
          {bot.found.map((chat) => (
            <div key={chat.chatId} className={classes.row}>
              <div className={classes.rowText}>
                <div className={classes.rowTitle}>{chat.title}</div>
                <div className={classes.rowTag}>{chatTypeLabel(chat.type, t)}</div>
              </div>
              <Button
                size="compact-xs"
                variant="light"
                leftSection={<Plus size={12} />}
                loading={bot.adding === chat.chatId}
                onClick={() => bot.add(chat.chatId)}
              >
                {t("reports.tgAddChat")}
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className={`${classes.inline} ${classes.manual}`}>
        <TextInput
          className={classes.grow}
          size="sm"
          placeholder={t("reports.tgAddByIdPlaceholder")}
          aria-label={t("reports.tgAddById")}
          value={bot.manualId}
          onChange={(e) => bot.setManualId(e.currentTarget.value)}
        />
        <Button
          size="sm"
          variant="default"
          loading={bot.adding === bot.manualId.trim()}
          disabled={!bot.manualId.trim()}
          onClick={() => bot.add(bot.manualId.trim())}
        >
          {t("reports.tgAddChat")}
        </Button>
      </div>
    </div>
  );
}
