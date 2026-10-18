import { useState } from "react";
import { useCreatePopupMutation, useDeletePopupMutation, useUpdatePopupMutation } from "@/features/popups/api";
import { toInput } from "@/features/popups/lib/popupOptions";
import type { Popup, PopupInput } from "@/features/popups/types";
import { useDemo } from "@/features/demo/context";
import { confirmDelete, errMessage, notify, notifyError } from "@/shared/lib/notify";

type Editing = { id: string | null; initial: PopupInput | null };

const DEMO_MESSAGE = "Demo data is read-only. Turn off demo mode to change popups.";

export function usePopupEditor(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [create, { isLoading: creating }] = useCreatePopupMutation();
  const [update, { isLoading: updating }] = useUpdatePopupMutation();
  const [remove] = useDeletePopupMutation();

  const openNew = () => setEditing({ id: null, initial: null });
  const openEdit = (popup: Popup) => setEditing({ id: popup.id, initial: toInput(popup) });
  const close = () => setEditing(null);

  const submit = async (input: PopupInput) => {
    if (!workspaceId || !editing) return;
    if (demo) return notify.error(DEMO_MESSAGE);
    try {
      if (editing.id) await update({ workspaceId, id: editing.id, ...input }).unwrap();
      else await create({ workspaceId, ...input }).unwrap();
      notify.success(
        editing.id ? "Popup updated. Your site picks it up within 5 minutes." : "Popup created. It goes live on your site within 5 minutes.",
        "Popups",
      );
      setEditing(null);
    } catch (e) {
      notifyError(e, "Could not save the popup.");
    }
  };

  const toggle = async (popup: Popup, enabled: boolean) => {
    if (!workspaceId) return;
    if (demo) return notify.error(DEMO_MESSAGE);
    setBusyId(popup.id);
    try {
      await update({ workspaceId, id: popup.id, ...toInput(popup), enabled }).unwrap();
    } catch (e) {
      notifyError(e, "Could not update the popup.");
    } finally {
      setBusyId(null);
    }
  };

  const askDelete = (popup: Popup) => {
    if (!workspaceId) return;
    if (demo) return notify.error(DEMO_MESSAGE);
    confirmDelete({
      title: "Delete popup?",
      body: <>“{popup.name}” will stop showing on your site. The form itself is not affected.</>,
      onConfirm: () => {
        setBusyId(popup.id);
        remove({ workspaceId, id: popup.id })
          .unwrap()
          .catch((e) => notify.error(errMessage(e, "Could not delete the popup.")))
          .finally(() => setBusyId(null));
      },
    });
  };

  return {
    editing,
    busyId,
    saving: creating || updating,
    openNew,
    openEdit,
    close,
    submit,
    toggle,
    askDelete,
  };
}
