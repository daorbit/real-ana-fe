import { useState } from "react";
import { useAddDbConnectionMutation } from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
import type { DbConnection } from "@/shared/types";

export type DbConnectionDraft = { label: string; uri: string; dbName: string; limitMb: number };

const EMPTY_DRAFT: DbConnectionDraft = { label: "", uri: "", dbName: "", limitMb: 512 };

export function useAddDbConnectionForm(onAdded: (connection: DbConnection) => void) {
  const [opened, setOpened] = useState(false);
  const [draft, setDraft] = useState<DbConnectionDraft>(EMPTY_DRAFT);
  const [add, { isLoading: saving }] = useAddDbConnectionMutation();

  const set = <K extends keyof DbConnectionDraft>(key: K, value: DbConnectionDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const open = () => {
    setDraft(EMPTY_DRAFT);
    setOpened(true);
  };

  const close = () => {
    setOpened(false);
    setDraft(EMPTY_DRAFT);
  };

  const canSubmit = draft.label.trim() !== "" && draft.uri.trim() !== "";

  const submit = async () => {
    if (!canSubmit) return;
    try {
      const created = await add({
        label: draft.label.trim(),
        uri: draft.uri.trim(),
        dbName: draft.dbName.trim() || undefined,
        limitMb: draft.limitMb,
      }).unwrap();
      close();
      notify.success("Connected. Its storage is in a new tab.", "Database added");
      onAdded(created);
    } catch (e) {
      notify.error(errMessage(e, "Could not add that database."));
    }
  };

  return { opened, draft, saving, canSubmit, set, open, close, submit };
}
