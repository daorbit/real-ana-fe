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
  const known = useRef<Set<string> | null>(null);
  const callbacks = useRef({ onLinked, onRemoved });
  callbacks.current = { onLinked, onRemoved };

  useRefetchOnFocus(query.refetch, query.fulfilledTimeStamp, FOCUS_MIN_AGE_MS, Boolean(workspaceId && (linkUrl || awaitingReturn)));

  useEffect(() => {
    if (!status) return;
    const ids = new Set(chats.map((c) => c.chatId));
    const previous = known.current;
    known.current = ids;
    if (!previous) return;
    const added = [...ids].filter((id) => !previous.has(id));
    if (!added.length) return;
    callbacks.current.onLinked?.(added);
    setLinkUrl(null);
    notify.success(t("reports.tgLinked"));
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
