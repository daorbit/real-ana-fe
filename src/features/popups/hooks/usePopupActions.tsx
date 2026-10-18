import { useState } from "react";
import { useCreatePopupMutation, useDeletePopupMutation, useUpdatePopupMutation } from "@/features/popups/api";
import { POPUP_DEMO_MESSAGE, toInput } from "@/features/popups/lib/popupOptions";
import type { Popup } from "@/features/popups/types";
import { useDemo } from "@/features/demo/context";
import { confirmDelete, errMessage, notify, notifyError } from "@/shared/lib/notify";

export function usePopupActions(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [create] = useCreatePopupMutation();
  const [update] = useUpdatePopupMutation();
  const [remove] = useDeletePopupMutation();

  const guard = () => {
    if (!workspaceId) return false;
    if (demo) {
      notify.error(POPUP_DEMO_MESSAGE);
      return false;
    }
    return true;
  };

  const toggle = async (popup: Popup, enabled: boolean) => {
    if (!guard() || !workspaceId) return;
    setBusyId(popup.id);
    try {
      await update({ workspaceId, id: popup.id, ...toInput(popup), enabled }).unwrap();
      notify.success(enabled ? `“${popup.name}” is live.` : `“${popup.name}” is paused.`, "Popups");
    } catch (e) {
      notifyError(e, "Could not update the popup.");
    } finally {
      setBusyId(null);
    }
  };

  const duplicate = async (popup: Popup) => {
    if (!guard() || !workspaceId) return;
    setBusyId(popup.id);
    try {
      await create({ workspaceId, ...toInput(popup), name: `${popup.name} (copy)`.slice(0, 80), enabled: false }).unwrap();
      notify.success("Copy created. It stays paused until you turn it on.", "Popups");
    } catch (e) {
      notifyError(e, "Could not duplicate the popup.");
    } finally {
      setBusyId(null);
    }
  };

  const askDelete = (popup: Popup) => {
    if (!guard() || !workspaceId) return;
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

  return { busyId, toggle, duplicate, askDelete };
}
