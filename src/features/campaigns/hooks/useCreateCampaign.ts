import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "@/app/store";
import { notifyError } from "@/shared/lib/notify";
import { seedCampaign, useCreateCampaignMutation } from "@/features/campaigns/api";
import { draftFromTemplate, type CampaignTemplate } from "@/features/campaigns/lib/campaignTemplates";

export function useCreateCampaign(workspaceId: string | undefined, lastAddress: string) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [create, state] = useCreateCampaignMutation();
  const [picked, setPicked] = useState<string | null>(null);

  const start = useCallback(
    async (template: CampaignTemplate) => {
      if (!workspaceId) return;
      setPicked(template.name);
      try {
        const created = await create({ workspaceId, ...draftFromTemplate(template, lastAddress) }).unwrap();
        await dispatch(seedCampaign(workspaceId, created));
        navigate(`/app/campaigns/${created.id}/edit`);
      } catch (e) {
        setPicked(null);
        notifyError(e, "Could not start the campaign.");
      }
    },
    [workspaceId, lastAddress, create, dispatch, navigate],
  );

  return { start, creating: state.isLoading || picked !== null, picked };
}
