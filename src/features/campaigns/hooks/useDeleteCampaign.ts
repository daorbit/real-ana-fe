import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { confirmDelete, notify, notifyError } from "@/shared/lib/notify";
import { useDeleteCampaignMutation } from "@/features/campaigns/api";

export function useDeleteCampaign(workspaceId: string | undefined) {
  const navigate = useNavigate();
  const [remove] = useDeleteCampaignMutation();

  return useCallback(
    (id: string) => {
      if (!workspaceId) return;
      confirmDelete({
        title: "Delete this campaign?",
        body: "Its email design and report are deleted too. Emails already sent can't be recalled.",
        onConfirm: async () => {
          try {
            await remove({ workspaceId, id }).unwrap();
            notify.info("Campaign deleted.");
            navigate("/app/campaigns");
          } catch (e) {
            notifyError(e, "Could not delete the campaign.");
          }
        },
      });
    },
    [workspaceId, remove, navigate],
  );
}
