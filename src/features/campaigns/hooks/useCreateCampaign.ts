import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notifyError } from "@/shared/lib/notify";
import { useCreateCampaignMutation } from "@/features/campaigns/api";
import { draftFromTemplate, type CampaignTemplate } from "@/features/campaigns/lib/campaignTemplates";

export function useCreateCampaign(workspaceId: string | undefined, lastAddress: string) {
  const navigate = useNavigate();
  const [create, state] = useCreateCampaignMutation();

  const start = useCallback(
    async (template: CampaignTemplate) => {
      if (!workspaceId) return;
      try {
        const created = await create({ workspaceId, ...draftFromTemplate(template, lastAddress) }).unwrap();
        navigate(`/app/campaigns/${created.id}/edit`);
      } catch (e) {
        notifyError(e, "Could not start the campaign.");
      }
    },
    [workspaceId, lastAddress, create, navigate],
  );

  return { start, creating: state.isLoading };
}
