import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifyError } from "@/shared/lib/notify";
import { useCreateCampaignMutation, useUpdateCampaignMutation } from "@/features/campaigns/api";
import { useCampaignDetail } from "@/features/campaigns/hooks/useCampaignDetail";
import { EMPTY_DRAFT } from "@/features/campaigns/lib/campaignLabels";
import type { Campaign, CampaignInput } from "@/features/campaigns/types";

function draftFrom(campaign: Campaign): CampaignInput {
  return {
    name: campaign.name,
    subject: campaign.subject,
    body: campaign.body,
    ctaLabel: campaign.ctaLabel,
    ctaUrl: campaign.ctaUrl,
    senderAddress: campaign.senderAddress,
    formIds: campaign.formIds,
    imported: campaign.imported ?? [],
  };
}

export function useCampaignEditor(workspaceId: string | undefined, campaignId: string | undefined) {
  const navigate = useNavigate();
  const detail = useCampaignDetail(workspaceId, campaignId);
  const [draft, setDraft] = useState<CampaignInput>(EMPTY_DRAFT);
  const [create, createState] = useCreateCampaignMutation();
  const [update, updateState] = useUpdateCampaignMutation();
  const loaded = detail.campaign;

  useEffect(() => {
    if (loaded) setDraft(draftFrom(loaded));
  }, [loaded?.id, loaded?.updatedAt]);

  const set = useCallback(<K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const save = useCallback(async (): Promise<string | null> => {
    if (!workspaceId) return null;
    try {
      if (campaignId) {
        await update({ workspaceId, id: campaignId, ...draft }).unwrap();
        return campaignId;
      }
      const created = await create({ workspaceId, ...draft }).unwrap();
      navigate(`/app/campaigns/${created.id}/edit`, { replace: true });
      return created.id;
    } catch (e) {
      notifyError(e, "Could not save the campaign.");
      return null;
    }
  }, [workspaceId, campaignId, draft, create, update, navigate]);

  return {
    draft,
    set,
    save,
    isNew: !campaignId,
    saving: createState.isLoading || updateState.isLoading,
    loading: Boolean(campaignId) && detail.loading,
    notFound: Boolean(campaignId) && detail.notFound,
    locked: Boolean(loaded) && loaded?.status !== "draft",
  };
}
