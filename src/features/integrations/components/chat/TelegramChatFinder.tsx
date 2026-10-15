import { useState } from "react";
import { Anchor, Button, Group, Text, UnstyledButton } from "@mantine/core";
import { Check, MessageCircle, Search, Users } from "lucide-react";
import { useFindFormsAppChatsMutation } from "@/app/store";
import { notifyError } from "@/shared/lib/notify";
import type { TelegramChatList } from "../../types";
import classes from "./Chat.module.css";

interface Props {
  workspaceId: string;
  botToken: string;
  hasSavedToken: boolean;
  chatId: string;
  disabled?: boolean;
  onPick: (chatId: string) => void;
}

const CHAT_TYPE: Record<string, string> = {
  private: "Direct chat",
  group: "Group",
  supergroup: "Group",
  channel: "Channel",
};

export function TelegramChatFinder({ workspaceId, botToken, hasSavedToken, chatId, disabled, onPick }: Props) {
  const [find, state] = useFindFormsAppChatsMutation();
  const [result, setResult] = useState<TelegramChatList | null>(null);
  const token = botToken.trim();
  const canSearch = Boolean(token) || hasSavedToken;

  const search = async () => {
    try {
      const list = await find({ workspaceId, appId: "telegram", botToken: token || undefined }).unwrap();
      setResult(list);
      if (list.chats.length === 1 && !chatId) onPick(list.chats[0].id);
    } catch (e) {
      notifyError(e, "Could not look up your bot's chats.");
    }
  };

  const botLink = result?.botUsername ? `https://t.me/${result.botUsername}` : undefined;

  return (
    <div className={classes.finder}>
      <Group justify="space-between" gap="sm" wrap="nowrap">
        <div className={classes.finderText}>
          <Text size="sm" fw={550}>
            Find your chat ID
          </Text>
          <Text size="xs" c="dimmed">
            {canSearch
              ? "Send your bot any message first, then look it up here."
              : "Paste the bot token above, then look up the chats it can post to."}
          </Text>
        </div>
        <Button
          type="button"
          size="xs"
          variant="default"
          leftSection={<Search size={14} />}
          loading={state.isLoading}
          disabled={!canSearch || disabled}
          onClick={search}
          className={classes.finderButton}
        >
          {result ? "Search again" : "Find my chat"}
        </Button>
      </Group>

      {result && result.chats.length === 0 && (
        <Text size="xs" c="dimmed" className={classes.finderEmpty}>
          No chats yet.{" "}
          {botLink ? (
            <Anchor href={botLink} target="_blank" rel="noreferrer" size="xs">
              Open @{result.botUsername}
            </Anchor>
          ) : (
            "Open your bot in Telegram"
          )}
          , press Start or send it any message, or add it to a group, then search again.
        </Text>
      )}

      {result && result.chats.length > 0 && (
        <div className={classes.chatList}>
          {result.chats.map((chat) => {
            const picked = chat.id === chatId;
            return (
              <UnstyledButton
                key={chat.id}
                type="button"
                className={classes.chatRow}
                data-picked={picked || undefined}
                disabled={disabled}
                onClick={() => onPick(chat.id)}
              >
                {chat.type === "private" ? (
                  <MessageCircle size={16} className={classes.chatIcon} />
                ) : (
                  <Users size={16} className={classes.chatIcon} />
                )}
                <div className={classes.chatText}>
                  <Text size="sm" fw={550} truncate>
                    {chat.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {CHAT_TYPE[chat.type] ?? chat.type} · {chat.id}
                  </Text>
                </div>
                {picked ? (
                  <Check size={16} className={classes.chatPicked} />
                ) : (
                  <Text size="xs" c="dimmed" className={classes.chatUse}>
                    Use
                  </Text>
                )}
              </UnstyledButton>
            );
          })}
        </div>
      )}
    </div>
  );
}
