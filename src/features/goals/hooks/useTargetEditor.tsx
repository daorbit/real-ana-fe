import { useState } from "react";
import { useCreateTargetMutation, useDeleteTargetMutation, useUpdateTargetMutation } from "@/features/goals/api";
import { confirmDelete, errMessage, notify, notifyError } from "@/shared/lib/notify";
import type { TargetInput, TargetProgress } from "@/features/goals/types";

type Editing = { id: string | null; initial: Partial<TargetInput> | null };

export function useTargetEditor(workspaceId: string | undefined) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [create, { isLoading: creating }] = useCreateTargetMutation();
  const [update, { isLoading: updating }] = useUpdateTargetMutation();
  const [remove] = useDeleteTargetMutation();

  const openNew = (initial: Partial<TargetInput> | null = null) => setEditing({ id: null, initial });

  const openEdit = (t: TargetProgress) =>
    setEditing({
      id: t.id,
      initial: { name: t.name, metric: t.metric, target: t.target, period: t.period, siteId: t.siteId, goalId: t.goalId },
    });

  const close = () => setEditing(null);

  const submit = async (input: TargetInput) => {
    if (!workspaceId || !editing) return;
    try {
      if (editing.id) await update({ workspaceId, id: editing.id, ...input }).unwrap();
      else await create({ workspaceId, ...input }).unwrap();
      notify.success(editing.id ? "Goal updated." : "Goal created — progress is live.", "Goals");
      setEditing(null);
    } catch (e) {
      notifyError(e, "Could not save the goal.");
    }
  };

  const askDelete = (t: TargetProgress) => {
    if (!workspaceId) return;
    confirmDelete({
      title: "Delete goal?",
      body: <>“{t.name}” will stop being tracked.</>,
      onConfirm: () => {
        setDeletingId(t.id);
        remove({ workspaceId, id: t.id })
          .unwrap()
          .catch((e) => notify.error(errMessage(e, "Could not delete the goal.")))
          .finally(() => setDeletingId(null));
      },
    });
  };

  return {
    editing,
    deletingId,
    saving: creating || updating,
    openNew,
    openEdit,
    close,
    submit,
    askDelete,
  };
}
