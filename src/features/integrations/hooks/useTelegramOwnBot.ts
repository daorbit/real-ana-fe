import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useAddTelegramChatMutation,
  useFindTelegramBotChatsMutation,
  useRemoveTelegramBotMutation,
  useSaveTelegramBotMutation,
} from "@/app/store";
import { confirmDelete, errMessage, notify } from "@/shared/lib/notify";
import type { TelegramChat } from "@/shared/types";

export function useTelegramOwnBot(workspaceId: string) {
  const { t } = useTranslation();
  const [token, setToken] = useState("");
  const [manualId, setManualId] = useState("");
  const [found, setFound] = useState<TelegramChat[] | null>(null);
  const [saveBot, saveState] = useSaveTelegramBotMutation();
  const [removeBot, removeState] = useRemoveTelegramBotMutation();
  const [findChats, findState] = useFindTelegramBotChatsMutation();
  const [addChat, addState] = useAddTelegramChatMutation();

  const save = async () => {
    try {
      await saveBot({ workspaceId, token: token.trim() }).unwrap();
      setToken("");
      setFound(null);
      notify.success(t("reports.tgOwnBotSaved"));
    } catch (e) {
      notify.error(errMessage(e, t("reports.tgOwnBotError")));
    }
  };

  const switchBack = () => {
    confirmDelete({
      title: t("reports.tgSwitchTitle"),
      body: t("reports.tgSwitchBody"),
      confirmLabel: t("reports.tgUseQuantalogBot"),
      onConfirm: async () => {
        try {
          await removeBot({ workspaceId }).unwrap();
          setFound(null);
        } catch (e) {
          notify.error(errMessage(e, t("reports.tgOwnBotError")));
        }
      },
    });
  };

  const find = async () => {
    try {
      const result = await findChats({ workspaceId }).unwrap();
      setFound(result.chats);
    } catch (e) {
      notify.error(errMessage(e, t("reports.tgFindError")));
    }
  };

  const add = async (chatId: string) => {
    try {
      await addChat({ workspaceId, chatId }).unwrap();
      setFound((prev) => prev?.filter((c) => c.chatId !== chatId) ?? null);
      if (chatId === manualId.trim()) setManualId("");
    } catch (e) {
      notify.error(errMessage(e, t("reports.tgAddError")));
    }
  };

  return {
    token,
    setToken,
    manualId,
    setManualId,
    found,
    saving: saveState.isLoading,
    removing: removeState.isLoading,
    finding: findState.isLoading,
    adding: addState.isLoading ? addState.originalArgs?.chatId ?? null : null,
    save,
    switchBack,
    find,
    add,
  };
}
