import { Anchor, Checkbox, Loader, Text } from "@mantine/core";
import { Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTelegramLink } from "@/features/integrations/hooks/useTelegramLink";
import { TelegramChatRow } from "@/features/integrations/components/telegram/TelegramChatRow";
import { TelegramConnectButtons } from "@/features/integrations/components/telegram/TelegramConnectButtons";
import { TelegramLinkWaiting } from "@/features/integrations/components/telegram/TelegramLinkWaiting";
import classes from "@/features/integrations/components/telegram/Telegram.module.css";

const CONNECTIONS_URL = "/app/settings/connections?app=telegram";

interface Props {
  workspaceId: string;
  selected: string[];
  onSelect: (chatIds: string[]) => void;
}

export function TelegramDelivery({ workspaceId, selected, onSelect }: Props) {
  const { t } = useTranslation();
  const tg = useTelegramLink(
    workspaceId,
    (added) => onSelect([...new Set([...selected, ...added])]),
    (removed) => onSelect(selected.filter((id) => id !== removed)),
  );
  const status = tg.status;

  if (tg.loading || !status) {
    return (
      <div className={classes.loading}>
        <Loader size="xs" />
      </div>
    );
  }

  const canLink = status.mode === "quantalog" && status.platformAvailable;
  const sender = status.mode === "own" ? status.ownBot?.username : status.platformBot;

  const toggle = (chatId: string, on: boolean) => {
    onSelect(on ? [...new Set([...selected, chatId])] : selected.filter((id) => id !== chatId));
  };

  return (
    <div className={classes.delivery}>
      <div className={classes.rows}>
        {tg.chats.length ? (
          <div className={classes.list}>
            {tg.chats.map((chat) => (
              <TelegramChatRow
                key={chat.chatId}
                chat={chat}
                onRemove={() => tg.remove(chat)}
                leading={
                  <Checkbox
                    size="xs"
                    checked={selected.includes(chat.chatId)}
                    onChange={(e) => toggle(chat.chatId, e.currentTarget.checked)}
                    aria-label={chat.title}
                  />
                }
              />
            ))}
          </div>
        ) : (
          <Text size="xs" c="dimmed" className={classes.empty}>
            {canLink ? t("reports.tgNoChats") : t("reports.tgNoChatsSettings")}
          </Text>
        )}
        {canLink && <TelegramConnectButtons linking={tg.linking} onConnect={(group) => void tg.connect(group)} />}
      </div>

      {tg.linkUrl && <TelegramLinkWaiting linkUrl={tg.linkUrl} checking={tg.checking} onCheck={tg.checkAgain} />}

      <Text size="xs" c="dimmed" className={classes.inline}>
        {sender && <span>{t(status.mode === "own" ? "reports.tgViaOwn" : "reports.tgViaQuantalog", { bot: sender })} ·</span>}
        <Anchor component={Link} to={CONNECTIONS_URL} target="_blank" size="xs" className={classes.inline} onClick={tg.expectReturn}>
          <Settings2 size={12} />
          {t("reports.tgManageInConnections")}
        </Anchor>
      </Text>
    </div>
  );
}
