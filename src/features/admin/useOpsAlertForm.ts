import { useEffect, useState } from "react";
import { useGetAdminOpsAlertsQuery, useSaveAdminOpsAlertsMutation, useTestAdminOpsAlertMutation } from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";

type Draft = { enabled: boolean; chatId: string; botToken: string };

export function useOpsAlertForm() {
  const { data, isLoading } = useGetAdminOpsAlertsQuery();
  const [save, { isLoading: saving }] = useSaveAdminOpsAlertsMutation();
  const [sendTest, { isLoading: testing }] = useTestAdminOpsAlertMutation();
  const [draft, setDraft] = useState<Draft>({ enabled: true, chatId: "", botToken: "" });

  useEffect(() => {
    if (data) setDraft({ enabled: data.enabled, chatId: data.chatId, botToken: "" });
  }, [data]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((prev) => ({ ...prev, [key]: value }));

  const dirty =
    Boolean(data) &&
    (draft.enabled !== data?.enabled || draft.chatId.trim() !== data?.chatId || draft.botToken.trim() !== "");

  const submit = async () => {
    try {
      await save({
        enabled: draft.enabled,
        chatId: draft.chatId.trim(),
        ...(draft.botToken.trim() ? { botToken: draft.botToken.trim() } : {}),
      }).unwrap();
      notify.success("Alert settings saved.", "Saved");
    } catch (e) {
      notify.error(errMessage(e, "Could not save the alert settings."));
    }
  };

  const removeToken = async () => {
    try {
      await save({ clearBotToken: true }).unwrap();
      notify.success("Bot token removed.", "Saved");
    } catch (e) {
      notify.error(errMessage(e, "Could not remove the bot token."));
    }
  };

  const test = async () => {
    try {
      await sendTest().unwrap();
      notify.success("Test alert sent. Check Telegram.", "Sent");
    } catch (e) {
      notify.error(errMessage(e, "Could not send the test alert."));
    }
  };

  return { data, draft, loading: isLoading || !data, saving, testing, dirty, set, submit, removeToken, test };
}
