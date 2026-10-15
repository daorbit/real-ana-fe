import { useEffect, useRef, useState } from "react";
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

export function useTelegramDelivery(opts: {
  workspaceId: string;
  selected: string[];
  onSelect: (chatIds: string[]) => void;
}) {
  const { t } = useTranslation();
  const { workspaceId, selected, onSelect } = opts;
  const query = useGetTelegramStatusQuery(workspaceId, { skip: !workspaceId });
  const status = query.currentData;
  const chats = status?.chats ?? EMPTY;
  const [createLink, linkState] = useCreateTelegramLinkMutation();
  const [removeChatMutation] = useRemoveTelegramChatMutation();
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const known = useRef<Set<string> | null>(null);
  const latest = useRef({ selected, onSelect });
  latest.current = { selected, onSelect };

  useRefetchOnFocus(query.refetch, query.fulfilledTimeStamp, FOCUS_MIN_AGE_MS, Boolean(linkUrl));

  useEffect(() => {
    if (!status) return;
    const ids = new Set(chats.map((c) => c.chatId));
    const previous = known.current;
    known.current = ids;
    if (!previous) return;
    const added = [...ids].filter((id) => !previous.has(id));
    if (!added.length) return;
    const { selected: current, onSelect: select } = latest.current;
    select([...new Set([...current, ...added])]);
    setLinkUrl(null);
    notify.success(t("reports.tgLinked"));
  }, [status, chats, t]);

  const connect = async (group: boolean) => {
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

  const toggle = (chatId: string, on: boolean) => {
    onSelect(on ? [...new Set([...selected, chatId])] : selected.filter((id) => id !== chatId));
  };

  const remove = (chat: TelegramChat) => {
    confirmDelete({
      title: t("reports.tgRemoveTitle"),
      body: t("reports.tgRemoveBody", { title: chat.title }),
      onConfirm: async () => {
        try {
          await removeChatMutation({ workspaceId, chatId: chat.chatId }).unwrap();
          latest.current.onSelect(latest.current.selected.filter((id) => id !== chat.chatId));
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
    toggle,
    remove,
  };
}
