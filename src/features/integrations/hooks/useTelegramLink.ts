import { useEffect, useRef, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import {
  useCreateTelegramLinkMutation,
  useGetTelegramStatusQuery,
  useRemoveTelegramChatMutation,
} from "@/app/store";
import { useRefetchOnFocus } from "@/shared/hooks/useRefetchOnFocus";
import { confirmDelete, errMessage, notify } from "@/shared/lib/notify";
import type { TelegramChat } from "@/shared/types";

const EMPTY: TelegramChat[] = [];
const FOCUS_MIN_AGE_MS = 1500;

export function useTelegramLink(workspaceId: string | null, onLinked?: (chatIds: string[]) => void, onRemoved?: (chatId: string) => void) {
  const { t } = useTranslation();
  const query = useGetTelegramStatusQuery(workspaceId ?? skipToken);
  const status = query.currentData;
  const chats = status?.chats ?? EMPTY;
  const [createLink, linkState] = useCreateTelegramLinkMutation();
  const [removeChatMutation] = useRemoveTelegramChatMutation();
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [awaitingReturn, setAwaitingReturn] = useState(false);
  const known = useRef<Map<string, string | undefined> | null>(null);
  const callbacks = useRef({ onLinked, onRemoved });
  callbacks.current = { onLinked, onRemoved };

  useRefetchOnFocus(query.refetch, query.fulfilledTimeStamp, FOCUS_MIN_AGE_MS, Boolean(workspaceId && (linkUrl || awaitingReturn)));

  useEffect(() => {
    if (!status) return;
    const previous = known.current;
    known.current = new Map(chats.map((c) => [c.chatId, c.linkedAt]));
    if (!previous) return;
    const linked = chats.filter((c) => !previous.has(c.chatId) || previous.get(c.chatId) !== c.linkedAt);
    if (!linked.length) return;
    const fresh = linked.filter((c) => !previous.has(c.chatId)).map((c) => c.chatId);
    if (fresh.length) callbacks.current.onLinked?.(fresh);
    setLinkUrl(null);
    notify.success(t("reports.tgLinkedTitle", { title: linked.map((c) => c.title).join(", ") }));
  }, [status, chats, t]);

  const connect = async (group: boolean) => {
    if (!workspaceId) return;
    const popup = window.open("", "_blank");
    try {
      const { url } = await createLink({ workspaceId, group }).unwrap();
      setLinkUrl(url);
      if (popup) popup.location.href = url;
    } catch (e) {
      popup?.close();
      notify.error(errMessage(e, t("reports.tgLinkError")));
    }
  };

  const remove = (chat: TelegramChat) => {
    if (!workspaceId) return;
    confirmDelete({
      title: t("reports.tgRemoveTitle"),
      body: t("reports.tgRemoveBody", { title: chat.title }),
      onConfirm: async () => {
        try {
          await removeChatMutation({ workspaceId, chatId: chat.chatId }).unwrap();
          callbacks.current.onRemoved?.(chat.chatId);
        } catch (e) {
          notify.error(errMessage(e, t("reports.tgRemoveError")));
        }
      },
    });
  };

  return {
    status,
    chats,
    loading: query.isLoading,
    checking: query.isFetching,
    linking: linkState.isLoading,
    linkUrl,
    connect,
    checkAgain: () => void query.refetch(),
    expectReturn: () => setAwaitingReturn(true),
    remove,
  };
}
