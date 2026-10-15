import { Anchor, Button, PasswordInput, Text, TextInput } from "@mantine/core";
import { Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TelegramStatus } from "@/shared/types";
import { chatTypeLabel } from "./TelegramChatRow";
import { useTelegramOwnBot } from "./useTelegramOwnBot";
import reportClasses from "../Reports.module.css";
import classes from "./Telegram.module.css";

export function TelegramOwnBot({ workspaceId, status }: { workspaceId: string; status: TelegramStatus }) {
  const { t } = useTranslation();
  const bot = useTelegramOwnBot(workspaceId);

  if (!status.ownBot) {
    return (
      <div className={classes.panel}>
        <span className={reportClasses.fieldLabel}>{t("reports.tgOwnBotTitle")}</span>
        <Text size="xs" c="dimmed" mb="xs">
          {t("reports.tgOwnBotHint")}
        </Text>
        <div className={classes.inline}>
          <PasswordInput
            className={classes.grow}
            size="sm"
            placeholder="123456789:AAH…"
            aria-label={t("reports.tgOwnBotToken")}
            value={bot.token}
            autoComplete="new-password"
            onChange={(e) => bot.setToken(e.currentTarget.value)}
          />
          <Button size="sm" onClick={bot.save} loading={bot.saving} disabled={!bot.token.trim()}>
            {t("reports.tgOwnBotSave")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.panel}>
      <div className={classes.inline}>
        <div className={classes.grow}>
          <Text size="sm" fw={500}>
            {t("reports.tgViaOwn", { bot: status.ownBot.username })}
          </Text>
          <Text size="xs" c="dimmed">
            {t("reports.tgFindHint")}
          </Text>
        </div>
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
        <div className={`${reportClasses.rows} ${classes.found}`}>
          {bot.found.map((chat) => (
            <div key={chat.chatId} className={reportClasses.recipient}>
              <span className={reportClasses.recipientEmail}>{chat.title}</span>
              <span className={reportClasses.recipientTag}>{chatTypeLabel(chat.type, t)}</span>
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

      {status.platformAvailable && (
        <Anchor component="button" type="button" size="xs" c="dimmed" mt="sm" onClick={bot.switchBack} disabled={bot.removing}>
          {t("reports.tgUseQuantalogBot")}
        </Anchor>
      )}
    </div>
  );
}
