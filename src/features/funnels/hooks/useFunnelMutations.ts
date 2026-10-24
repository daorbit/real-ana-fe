import { useCreateFunnelMutation, useDeleteFunnelMutation, useUpdateFunnelMutation } from "@/app/store";
import { notify, notifyError } from "@/shared/lib/notify";
import { filledSteps, type Draft } from "../lib/funnelDraft";

export function useFunnelMutations(workspaceId: string | undefined) {
  const [create, { isLoading: creating }] = useCreateFunnelMutation();
  const [update, { isLoading: updating }] = useUpdateFunnelMutation();
  const [remove, { isLoading: deleting }] = useDeleteFunnelMutation();

  const save = async (name: string, steps: Draft[], funnelId: string | null): Promise<string | null> => {
    if (!workspaceId) return null;
    const payload = filledSteps(steps);
    try {
      if (funnelId) {
        await update({ workspaceId, funnelId, name, steps: payload }).unwrap();
        notify.success("Funnel saved.");
        return funnelId;
      }
      const created = await create({ workspaceId, name, steps: payload }).unwrap();
      notify.success("Funnel created.");
      return created.id;
    } catch (e) {
      notifyError(e, "Could not save the funnel.");
      return null;
    }
  };

  const destroy = async (funnelId: string): Promise<boolean> => {
    if (!workspaceId) return false;
    try {
      await remove({ workspaceId, funnelId }).unwrap();
      notify.success("Funnel deleted.");
      return true;
    } catch (e) {
      notifyError(e, "Could not delete the funnel.");
      return false;
    }
  };

  return { save, destroy, saving: creating || updating, deleting };
}
