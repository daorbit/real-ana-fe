import { confirmDelete, notify, notifyError } from "@/shared/lib/notify";
import {
  useCreateStatusIncidentMutation,
  useDeleteStatusIncidentMutation,
  useEditStatusIncidentMutation,
  usePostStatusUpdateMutation,
} from "./api";
import type { IncidentDraft, IncidentEdit, UpdateDraft } from "./types";

export function useStatusActions() {
  const [create, createState] = useCreateStatusIncidentMutation();
  const [post, postState] = usePostStatusUpdateMutation();
  const [edit, editState] = useEditStatusIncidentMutation();
  const [remove] = useDeleteStatusIncidentMutation();

  const run = async (work: () => Promise<unknown>, success: string, failure: string): Promise<boolean> => {
    try {
      await work();
      notify.success(success);
      return true;
    } catch (e) {
      notifyError(e, failure);
      return false;
    }
  };

  return {
    creating: createState.isLoading,
    posting: postState.isLoading,
    editing: editState.isLoading,
    create: (draft: IncidentDraft) =>
      run(() => create(draft).unwrap(), draft.notify ? "Incident published. Subscribers are being emailed." : "Incident published.", "Could not publish the incident."),
    post: (id: string, update: UpdateDraft) =>
      run(() => post({ id, update }).unwrap(), "Update posted.", "Could not post the update."),
    edit: (id: string, change: IncidentEdit) => run(() => edit({ id, edit: change }).unwrap(), "Incident saved.", "Could not save the incident."),
    remove: (id: string, onDone: () => void) =>
      confirmDelete({
        title: "Delete this incident?",
        body: "It disappears from the public status page and its history. Emails already sent can't be recalled.",
        onConfirm: async () => {
          if (await run(() => remove(id).unwrap(), "Incident deleted.", "Could not delete the incident.")) onDone();
        },
      }),
  };
}
