import { Switch, Text } from "@mantine/core";
import { useSetTelegramFormAlertsMutation } from "@/app/store";
import { notifyError } from "@/shared/lib/notify";
import type { TelegramChat } from "@/shared/types";
import type { useTelegramLink } from "../../hooks/useTelegramLink";
import { TelegramChatRow } from "./TelegramChatRow";
import { TelegramConnectButtons } from "./TelegramConnectButtons";
import classes from "./Telegram.module.css";

interface Props {
  workspaceId: string;
  link: ReturnType<typeof useTelegramLink>;
  canLink: boolean;
}

export function TelegramLinkedChats({ workspaceId, link, canLink }: Props) {
  const [setFormAlerts, state] = useSetTelegramFormAlertsMutation();

  const toggle = async (chat: TelegramChat, formAlerts: boolean) => {
    try {
      await setFormAlerts({ workspaceId, chatId: chat.chatId, formAlerts }).unwrap();
    } catch (e) {
      notifyError(e, "Could not change form alerts for this chat.");
    }
  };

  return (
    <div className={classes.rows}>
      {link.chats.length ? (
        <div className={classes.list}>
          {link.chats.map((chat) => (
            <TelegramChatRow
              key={chat.chatId}
              chat={chat}
              onRemove={() => link.remove(chat)}
              trailing={
                <Switch
                  size="xs"
                  label="Form alerts"
                  checked={Boolean(chat.formAlerts)}
                  disabled={state.isLoading && state.originalArgs?.chatId === chat.chatId}
                  onChange={(e) => void toggle(chat, e.currentTarget.checked)}
                />
              }
            />
          ))}
        </div>
      ) : (
        <Text size="xs" c="dimmed" className={classes.empty}>
          {canLink ? "No chats linked yet. Connect your own chat or a group below." : "No chats linked yet. Find your bot's chats below."}
        </Text>
      )}
      {canLink && <TelegramConnectButtons linking={link.linking} onConnect={(group) => void link.connect(group)} />}
    </div>
  );
}
