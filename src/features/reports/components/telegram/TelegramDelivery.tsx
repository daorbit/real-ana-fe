import { useState } from "react";
import { Anchor, Button, Group, Loader, Text } from "@mantine/core";
import { RefreshCw, Send, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TelegramChatRow } from "./TelegramChatRow";
import { TelegramOwnBot } from "./TelegramOwnBot";
import { useTelegramDelivery } from "./useTelegramDelivery";
import reportClasses from "../Reports.module.css";
import classes from "./Telegram.module.css";

interface Props {
  workspaceId: string;
  selected: string[];
  onSelect: (chatIds: string[]) => void;
}

export function TelegramDelivery({ workspaceId, selected, onSelect }: Props) {
  const { t } = useTranslation();
  const tg = useTelegramDelivery({ workspaceId, selected, onSelect });
  const [ownOpen, setOwnOpen] = useState(false);
  const status = tg.status;

  if (tg.loading || !status) {
    return (
      <div className={classes.loading}>
        <Loader size="xs" />
      </div>
    );
  }

  const usingOwn = status.mode === "own";
  const showOwn = usingOwn || ownOpen || !status.platformAvailable;

  return (
    <div className={classes.delivery}>
      <div>
        <span className={reportClasses.fieldLabel}>{t("reports.tgChatsLabel")}</span>
        <div className={reportClasses.rows}>
          {tg.chats.length ? (
            <div className={reportClasses.recipientList}>
              {tg.chats.map((chat) => (
                <TelegramChatRow
                  key={chat.chatId}
                  chat={chat}
                  checked={selected.includes(chat.chatId)}
                  onToggle={(on) => tg.toggle(chat.chatId, on)}
                  onRemove={() => tg.remove(chat)}
                />
              ))}
            </div>
          ) : (
            <Text size="xs" c="dimmed" className={classes.empty}>
              {t("reports.tgNoChats")}
            </Text>
          )}

          {!usingOwn && status.platformAvailable && (
            <div className={reportClasses.addRow}>
              <Button
                size="xs"
                variant="light"
                leftSection={<Send size={14} />}
                loading={tg.linking}
                onClick={() => tg.connect(false)}
              >
                {t("reports.tgConnectChat")}
              </Button>
              <Button size="xs" variant="default" leftSection={<Users size={14} />} onClick={() => tg.connect(true)}>
                {t("reports.tgConnectGroup")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {tg.linkUrl && (
        <div className={classes.waiting}>
          <Text size="xs">{t("reports.tgWaiting")}</Text>
          <Group gap="xs" mt={8}>
            <Button
              size="compact-xs"
              variant="default"
              leftSection={<RefreshCw size={12} />}
              loading={tg.checking}
              onClick={tg.checkAgain}
            >
              {t("reports.tgCheckAgain")}
            </Button>
            <Anchor href={tg.linkUrl} target="_blank" rel="noreferrer" size="xs">
              {t("reports.tgOpenAgain")}
            </Anchor>
          </Group>
        </div>
      )}

      {!status.platformAvailable && !usingOwn && (
        <Text size="xs" c="dimmed">
          {t("reports.tgPlatformMissing")}
        </Text>
      )}

      {showOwn ? (
        <TelegramOwnBot workspaceId={workspaceId} status={status} />
      ) : (
        <Text size="xs" c="dimmed">
          {status.platformBot && t("reports.tgViaQuantalog", { bot: status.platformBot })}
          {" · "}
          <Anchor component="button" type="button" size="xs" onClick={() => setOwnOpen(true)}>
            {t("reports.tgUseOwnBot")}
          </Anchor>
        </Text>
      )}
    </div>
  );
}
