import { useDeleteEmbedMutation, useUpdateEmbedMutation } from "@/features/dashboards/api";
import { confirmDelete, errMessage, notify } from "@/shared/lib/notify";
import type { Embed } from "@/features/dashboards/types";

export function useEmbedActions(workspaceId: string) {
  const [update] = useUpdateEmbedMutation();
  const [remove] = useDeleteEmbedMutation();

  const toggleEmbed = async (e: Embed, enabled: boolean) => {
    try {
      await update({ workspaceId, id: e.id, enabled }).unwrap();
    } catch (err) {
      notify.error(errMessage(err, "Could not update the embed."));
    }
  };

  const deleteEmbed = (e: Embed) =>
    confirmDelete({
      title: "Delete embed?",
      body: <>“{e.name}” will stop loading on every site it's embedded on. This can't be undone.</>,
      onConfirm: async () => {
        try {
          await remove({ workspaceId, id: e.id }).unwrap();
        } catch (err) {
          notify.error(errMessage(err, "Could not delete the embed."));
        }
      },
    });

  return { toggleEmbed, deleteEmbed };
}
