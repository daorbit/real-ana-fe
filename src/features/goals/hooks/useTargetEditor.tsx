import { useState } from "react";
import { useDispatch } from "react-redux";
import { hideTarget, useCreateTargetMutation, useDeleteTargetMutation, useUpdateTargetMutation } from "@/features/goals/api";
import { notify, notifyError } from "@/shared/lib/notify";
import { deferDelete } from "@/shared/lib/deferDelete";
import type { AppDispatch } from "@/app/store";
import type { TargetInput, TargetProgress } from "@/features/goals/types";

type Editing = { id: string | null; initial: Partial<TargetInput> | null };

const NO_DELETING: string | null = null;

export function useTargetEditor(workspaceId: string | undefined) {
  const dispatch = useDispatch<AppDispatch>();
  const [editing, setEditing] = useState<Editing | null>(null);
  const deletingId = NO_DELETING;
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
    deferDelete({
      key: `target:${t.id}`,
      message: `“${t.name}” deleted`,
      errorMessage: "Could not delete the goal.",
      hide: () => dispatch(hideTarget(workspaceId, t.id)),
      commit: () => remove({ workspaceId, id: t.id }).unwrap(),
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
